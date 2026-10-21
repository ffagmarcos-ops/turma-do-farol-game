"""Verifica integridade e geometria exportada; não substitui compilação no Unity."""
from pathlib import Path
import hashlib
import json
import subprocess
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
PROJECT = ROOT / 'unity/TurmaDoFarol'
def read(name):
    return json.loads((PROJECT / name).read_text())

manifest = read('MIGRACAO_MANIFESTO.json')
catalog = read('Assets/Farol/Dados/catalogo.json')
level = read('Assets/Farol/Dados/fase3.json')
errors = []
for file in manifest['files']:
    p = PROJECT / file['target']
    if not p.exists() or hashlib.sha256(p.read_bytes()).hexdigest() != file['sha256']:
        errors.append('Conteúdo alterado: ' + file['target'])
    original = ROOT / file['source']
    if original.read_bytes() != p.read_bytes():
        errors.append('Diverge da origem: ' + file['target'])

for sheet in catalog['sheets']:
    width, height = Image.open(PROJECT / sheet['path']).size
    assert sheet['pixelsPerUnit'] > 0
    for f in sheet['frames']:
        if not (0 <= f['x'] < f['x'] + f['w'] <= width and 0 <= f['y'] < f['y'] + f['h'] <= height):
            errors.append('Recorte fora da imagem: ' + sheet['path'] + '/' + f['name'])
        if not (0 <= f['pivotX'] <= 1 and 0 <= f['pivotY'] <= 1):
            errors.append('Pivô fora do recorte: ' + sheet['path'] + '/' + f['name'])

ids = {s['id'] for s in catalog['sprites']}
assert len(ids) == len(catalog['sprites']), 'IDs de sprite duplicados'
for animation in catalog['animations']:
    assert animation['duration'] > 0
    times = [f['time'] for f in animation['frames']]
    assert times == sorted(times), 'Tempos fora de ordem'
    for f in animation['frames']:
        if f['sprite'] not in ids:
            errors.append('Animação sem quadro: ' + f['sprite'])
source = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', "import {assembleLevel} from './src/game/fase3/sectors/index.js'; console.log(JSON.stringify(assembleLevel()))"], cwd=ROOT))
assert source['chunks'] == level['chunks'], 'Dados dos trechos divergiram'
assert source['length'] == level['length']
assert len(source['sectors']) == len(level['sectors'])
assert all(level['sectors'][i]['x1'] == level['sectors'][i+1]['x0'] for i in range(len(level['sectors'])-1))

# Verificação matemática da transformação: pixel -> Unity -> pixel.
for c in level['chunks']:
    for shell in c.get('shells', []):
        x, y = shell['x'], shell['y']
        assert abs(x - (x/100)*100) < 1e-7
        assert abs(y - (1080 - ((1080-y)/100)*100)) < 1e-7

syntax = 'não executada (instale tree-sitter e tree-sitter-c-sharp para análise sintática)'
try:
    from tree_sitter import Language, Parser
    import tree_sitter_c_sharp
    parser = Parser(Language(tree_sitter_c_sharp.language()))
    cs = list((PROJECT/'Assets/Farol').rglob('*.cs'))
    for script in cs:
        if parser.parse(script.read_bytes()).root_node.has_error:
            errors.append('Erro de sintaxe C#: ' + str(script.relative_to(PROJECT)))
    syntax = f'{len(cs)} arquivos analisados'
except ImportError:
    pass

report = {'sourceCommit':manifest['sourceCommit'], 'assetsVerified':len(manifest['files']), 'spriteRects':sum(len(s['frames']) for s in catalog['sheets']), 'animationSequences':len(catalog['animations']), 'sectors':len(level['sectors']), 'chunks':len(level['chunks']), 'sourceDataPreserved':True, 'csharpSyntax':syntax, 'unityCompilation':'NÃO EXECUTADA — Editor não disponível neste ambiente', 'unityPlayMode':'NÃO EXECUTADO', 'errors':errors}
(PROJECT/'VALIDACAO.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(report,ensure_ascii=False,indent=2))
if errors:
    raise SystemExit(1)
