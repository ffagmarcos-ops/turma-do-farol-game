using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using UnityEditor;
using UnityEditor.Animations;
using UnityEditor.SceneManagement;
using UnityEditor.U2D.Sprites;
using UnityEngine;
using UnityEngine.SceneManagement;

namespace TurmaDoFarol.Editor
{
    public static class FarolMigration
    {
        const string Data="Assets/Farol/Dados/";
        static FarolCatalog catalog;static FarolMap map;
        static Dictionary<string,Sprite> sprites;
        static string output;static AnimatorController controller;static Sprite white;
        static FarolPlayerController player;static Camera camera;
        static int missing;

        [MenuItem("Turma do Farol/1 - Preparar projeto e cenas")]
        public static void Prepare()
        {
            if(!EditorSceneManager.SaveCurrentModifiedScenesIfUserWantsTo())return;
            catalog=JsonUtility.FromJson<FarolCatalog>(File.ReadAllText(Data+"catalogo.json"));
            map=JsonUtility.FromJson<FarolMap>(File.ReadAllText(Data+"fase3.json"));
            output="Assets/Farol/Gerado/Importacao_"+DateTime.Now.ToString("yyyyMMdd_HHmmss_fff");
            Directory.CreateDirectory(output);AssetDatabase.Refresh();missing=0;
            try {
                ImportSprites();MakeAnimations();
                var paths=new List<string>();
                paths.Add(BuildIsland());paths.Add(BuildVillage());
                EditorBuildSettings.scenes=paths.Select(p=>new EditorBuildSettingsScene(p,true)).ToArray();
                EditorSettings.defaultBehaviorMode=EditorBehaviorMode.Mode2D;
                PlayerSettings.companyName="Turma do Farol";PlayerSettings.productName="Turma do Farol - Migracao Unity";
                PlayerSettings.defaultScreenWidth=1920;PlayerSettings.defaultScreenHeight=1080;
                AssetDatabase.SaveAssets();
                File.WriteAllText(output+"/RELATORIO.txt","Origem: "+map.sourceCommit+"\nCenas geradas: "+string.Join(", ",paths)+"\nElementos com arte provisoria: "+missing+"\nConsulte LEIA-ME_UNITY.md. Mecânicas ainda não portadas estão marcadas no Inspector.\n");
                AssetDatabase.Refresh();EditorSceneManager.OpenScene(paths[0]);
                Debug.Log("Turma do Farol: importacao concluida. Abra o README e valide a cena no Editor antes de publicar. "+output);
                if(!Application.isBatchMode)EditorUtility.DisplayDialog("Turma do Farol","A cena Fase3_Ilha foi criada e aberta. Pressione Play para testar a base. As artes faltantes e as mecânicas pendentes estão identificadas no Inspector e no README.","OK");
            } finally {EditorUtility.ClearProgressBar();}
        }

        [MenuItem("Turma do Farol/2 - Abrir instrucoes")]
        public static void Instructions(){EditorUtility.OpenWithDefaultApp(Path.GetFullPath("LEIA-ME_UNITY.md"));}

        static void ImportSprites()
        {
            var sheets=catalog.sheets.ToDictionary(s=>s.path);
            var factories=new SpriteDataProviderFactories();factories.Init();
            var paths=catalog.sprites.Select(s=>s.path).Distinct().ToArray();
            for(int i=0;i<paths.Length;i++) {
                var path=paths[i];EditorUtility.DisplayProgressBar("Turma do Farol","Importando sprites: "+Path.GetFileName(path),(float)i/paths.Length);
                var importer=AssetImporter.GetAtPath(path) as TextureImporter;
                if(importer==null)throw new InvalidOperationException("Imagem não importada pelo Unity: "+path);
                importer.textureShape=TextureImporterShape.Texture2D;
                importer.textureType=TextureImporterType.Sprite;importer.mipmapEnabled=false;importer.alphaIsTransparency=true;
                importer.maxTextureSize=8192;importer.textureCompression=TextureImporterCompression.Uncompressed;
                importer.filterMode=FilterMode.Bilinear;importer.wrapMode=TextureWrapMode.Clamp;
                var settings=new TextureImporterSettings();importer.ReadTextureSettings(settings);settings.spriteMeshType=SpriteMeshType.FullRect;importer.SetTextureSettings(settings);
                if(sheets.TryGetValue(path,out var sheet)) {
                    importer.spriteImportMode=SpriteImportMode.Multiple;importer.spritePixelsPerUnit=sheet.pixelsPerUnit;
                    var provider=factories.GetSpriteEditorDataProviderFromObject(importer);provider.InitSpriteEditorDataProvider();
                    var rects=sheet.frames.Select(f=>new SpriteRect {name=f.name,rect=new Rect(f.x,f.y,f.w,f.h),alignment=SpriteAlignment.Custom,pivot=new Vector2(f.pivotX,f.pivotY),spriteID=new GUID(f.guid)}).ToArray();
                    provider.SetSpriteRects(rects);
                    var names=provider.GetDataProvider<ISpriteNameFileIdDataProvider>();
                    if(names!=null)names.SetNameFileIdPairs(rects.Select(r=>new SpriteNameFileIdPair(r.name,r.spriteID)).ToArray());
                    provider.Apply();
                } else {importer.spriteImportMode=SpriteImportMode.Single;importer.spritePixelsPerUnit=100;}
                importer.SaveAndReimport();
            }
            sprites=new Dictionary<string,Sprite>();
            foreach(var group in catalog.sprites.GroupBy(s=>s.path)) {
                var found=AssetDatabase.LoadAllAssetsAtPath(group.Key).OfType<Sprite>().ToArray();
                foreach(var s in group){var sprite=s.multiple?found.FirstOrDefault(f=>f.name==s.name):found.FirstOrDefault();if(sprite)sprites[s.id]=sprite;}
            }
            foreach(var alias in catalog.images)if(sprites.TryGetValue(alias.sprite,out var sprite))sprites[alias.key]=sprite;
            var texture=new Texture2D(2,2,TextureFormat.RGBA32,false);texture.SetPixels(new[]{Color.white,Color.white,Color.white,Color.white});texture.Apply();
            string whitePath=output+"/BlocoProvisorio.png";File.WriteAllBytes(whitePath,texture.EncodeToPNG());UnityEngine.Object.DestroyImmediate(texture);AssetDatabase.ImportAsset(whitePath);
            var whiteImporter=(TextureImporter)AssetImporter.GetAtPath(whitePath);whiteImporter.textureType=TextureImporterType.Sprite;whiteImporter.spritePixelsPerUnit=2;whiteImporter.spriteImportMode=SpriteImportMode.Single;whiteImporter.SaveAndReimport();white=AssetDatabase.LoadAssetAtPath<Sprite>(whitePath);
        }

        static void MakeAnimations()
        {
            string dir=output+"/Animacoes";Directory.CreateDirectory(dir);AssetDatabase.Refresh();
            controller=AnimatorController.CreateAnimatorControllerAtPath(output+"/Farol.controller");
            var machine=controller.layers[0].stateMachine;
            foreach(var data in catalog.animations) {
                var clip=new AnimationClip{name=data.key,frameRate=data.fps};
                var curve=new List<ObjectReferenceKeyframe>();
                foreach(var f in data.frames){if(!sprites.TryGetValue(f.sprite,out var image))throw new InvalidOperationException("Quadro ausente: "+f.sprite);curve.Add(new ObjectReferenceKeyframe{time=f.time,value=image});}
                if(curve.Count==0)continue;
                curve.Add(new ObjectReferenceKeyframe{time=data.duration,value=curve[curve.Count-1].value});
                AnimationUtility.SetObjectReferenceCurve(clip,new EditorCurveBinding{path="",type=typeof(SpriteRenderer),propertyName="m_Sprite"},curve.ToArray());
                var settings=AnimationUtility.GetAnimationClipSettings(clip);settings.loopTime=data.loop;AnimationUtility.SetAnimationClipSettings(clip,settings);
                AssetDatabase.CreateAsset(clip,dir+"/"+data.key+".anim");
                var state=machine.AddState(data.key.Replace('.','_'));state.motion=clip;if(data.key=="bia.idle")machine.defaultState=state;
            }
        }

        static GameObject Node(string name,Transform parent,Vector3 position)
        {var go=new GameObject(name);go.transform.SetParent(parent,false);go.transform.position=position;return go;}
        static Sprite Art(string key){return !string.IsNullOrEmpty(key)&&sprites.TryGetValue(key,out var s)?s:null;}
        static string Tile(string sector,string key)=>map.tiles.FirstOrDefault(t=>t.sector==sector&&t.key==key)?.sprite;
        static SpriteRenderer Visual(GameObject go,string key,float width=0,float height=0,int order=0)
        {
            var sr=go.AddComponent<SpriteRenderer>();sr.sprite=Art(key);sr.sortingOrder=order;
            if(!sr.sprite){sr.sprite=white;sr.color=new Color(.57f,.65f,.58f,.8f);missing++;}
            if(width>0&&height>0){sr.drawMode=SpriteDrawMode.Sliced;sr.size=new Vector2(width,height);}
            return sr;
        }
        static void Source(GameObject go,string sector,string category,object data,bool pending=false,string note="")
        {var m=go.AddComponent<FarolSourceMarker>();m.sector=sector;m.category=category;m.originalJson=JsonUtility.ToJson(data,true);m.requiresPort=pending;m.nextStep=note;if(data is MapItem item)m.sourceId=item.id;}
        static IEnumerable<MapItem> Items(MapItem[] list)=>list??Array.Empty<MapItem>();
        static BoxCollider2D Box(GameObject go,float w,float h,bool trigger=false)
        {var box=go.AddComponent<BoxCollider2D>();box.size=new Vector2(Mathf.Max(.05f,w),Mathf.Max(.05f,h));box.isTrigger=trigger;if(trigger)go.layer=2;return box;}
        static float GroundY(ChunkData c,float x,float fallback)
        {var hits=Items(c.ground).Where(g=>x>=g.x&&x<=g.x+g.w).ToArray();return hits.Length>0?hits.Min(g=>g.y==0?fallback:g.y):fallback;}

        static void StartScene(string name,float length,Vector2 spawn,bool bia)
        {
            EditorSceneManager.NewScene(NewSceneSetup.EmptyScene,NewSceneMode.Single);
            var cam=new GameObject("Main Camera");cam.tag="MainCamera";camera=cam.AddComponent<Camera>();camera.orthographic=true;camera.orthographicSize=5.4f;camera.clearFlags=CameraClearFlags.SolidColor;camera.backgroundColor=new Color(.38f,.72f,.83f);cam.transform.position=new Vector3(9.6f,5.4f,-10);cam.AddComponent<AudioListener>();
            var hero=Node(bia?"Bia — protagonista":"Marina — protagonista",null,spawn);hero.layer=8;
            Visual(hero,bia?"bia_locomotion/f000":"hq_marina/f000",0,0,20);
            if(bia)hero.AddComponent<Animator>().runtimeAnimatorController=controller;
            hero.AddComponent<Rigidbody2D>();hero.AddComponent<BoxCollider2D>();player=hero.AddComponent<FarolPlayerController>();player.respawnPosition=spawn;player.useBiaAnimations=bia;player.projectileSprite=Art("shell_projectile/f000");
            if(!bia){player.walkSpeed=2.1f;player.runSpeed=3.6f;player.jumpSpeed=8.2f;player.maximumJumps=1;player.bodyWidth=1.06f;player.standingHeight=2.34f;player.crouchingHeight=1.8f;}
            var follow=cam.AddComponent<FarolCamera>();follow.target=hero.transform;follow.levelWidth=length/100;
            var session=new GameObject("Sessao e progresso local").AddComponent<FarolGameSession>();session.stage=name;session.player=player;
        }

        static GameObject Solid(Transform parent,string sector,MapItem item,float y,float height,bool platform)
        {
            var go=Node((platform?"Plataforma ":"Solo ")+(item.id??item.kind??item.tiles),parent,FarolCoordinates.RectCenter(item.x,y,item.w,height));
            Box(go,item.w/100,height/100);
            string key=platform?Tile(sector,item.kind=="crumble"?"crumble":item.kind=="ledge"?"ledge":"log"):Tile(sector,(item.tiles=="rock"?"rock":"sand")+"_top");
            if(platform)Visual(go,key,item.w/100,height/100,5);
            else {
                float cap=Mathf.Min(128,height);
                var top=Node("Superficie",go.transform,FarolCoordinates.RectCenter(item.x,y,item.w,cap));
                var topRenderer=Visual(top,key,item.w/100,cap/100,5);topRenderer.drawMode=SpriteDrawMode.Tiled;
                if(height>cap){var fill=Node("Preenchimento",go.transform,FarolCoordinates.RectCenter(item.x,y+cap,item.w,height-cap));var fillRenderer=Visual(fill,Tile(sector,(item.tiles=="rock"?"rock":"sand")+"_fill"),item.w/100,(height-cap)/100,4);fillRenderer.drawMode=SpriteDrawMode.Tiled;}
            }
            if(platform){var eff=go.AddComponent<PlatformEffector2D>();eff.useOneWay=true;eff.surfaceArc=170;go.GetComponent<BoxCollider2D>().usedByEffector=true;}
            if(item.moveX!=0||item.moveY!=0||item.sway){go.AddComponent<Rigidbody2D>().bodyType=RigidbodyType2D.Kinematic;var mover=go.AddComponent<FarolMovingPlatform>();mover.amplitude=new Vector2(item.moveX==0&&item.sway?60:item.moveX,-item.moveY)/100;mover.speed=item.speed>0?item.speed:1.5f;mover.phase=item.phase;}
            Source(go,sector,platform?"platforms":"ground",item,item.crumble||item.slippery,item.crumble?"Portar rachadura, queda e restauração.":item.slippery?"Ajustar atrito do piso molhado.":"");
            return go;
        }

        static string BuildIsland()
        {
            StartScene("fase3",map.length,FarolCoordinates.Point(150,896),true);
            var roots=new Dictionary<string,Transform>();
            foreach(var s in map.sectors){var root=new GameObject("Setor "+s.id+" — "+s.name).transform;roots[s.id]=root;Source(root.gameObject,s.id,"sector",s);Background(s,root);}
            var dog=Node("Faisca — companheiro",null,FarolCoordinates.Point(55,895));dog.layer=8;Visual(dog,"faisca_run/f000",0,0,19);dog.AddComponent<Animator>().runtimeAnimatorController=controller;dog.AddComponent<Rigidbody2D>();var dogBox=Box(dog,.468f,.364f);dogBox.offset=Vector2.up*.182f;dog.AddComponent<FarolCompanion>().player=player;
            foreach(var c in map.chunks) {
                var root=new GameObject("Trecho "+c.id).transform;root.SetParent(roots[c.sector],false);Source(root.gameObject,c.sector,"chunk",c);
                float ground=map.sectors.First(s=>s.id==c.sector).groundY;
                foreach(var g in Items(c.ground)){float y=g.y==0?ground:g.y;Solid(root,c.sector,g,y,Mathf.Max(64,1200-y),false);}
                foreach(var g in Items(c.blocks))Solid(root,c.sector,g,g.y,g.h,false);
                foreach(var g in Items(c.platforms))Solid(root,c.sector,g,g.y,32,true);
                foreach(var g in Items(c.breakables)){var wall=Solid(root,c.sector,g,g.y,g.h,false);wall.name="Parede quebravel "+g.id;wall.AddComponent<FarolBreakable>();}
                foreach(var d in Items(c.decor)) {
                    var def=map.props.FirstOrDefault(p=>p.sector==c.sector&&p.key==d.kind);float scale=d.scale==0?1:d.scale;float w=(def?.w??120)*scale,h=(def?.h??120)*scale;
                    var go=Node("Decoracao "+d.kind,root,FarolCoordinates.Point(d.x,d.y-h/2));Visual(go,def?.sprite,w/100,h/100,d.front?30:2).flipX=d.flip;Source(go,c.sector,"decor",d,Art(def?.sprite)==null,"Conferir arte pendente e escala visual.");
                }
                foreach(var shell in Items(c.shells))Pickup(root,c.sector,shell,"shell",shell.gold?5:1);
                foreach(var cp in Items(c.checkpoints))Checkpoint(root,c.sector,cp,GroundY(c,cp.x,ground));
                foreach(var water in Items(c.water)) {
                    float h=1200-water.y;var go=Node("Agua — retorno seguro",root,FarolCoordinates.RectCenter(water.x,water.y,water.w,h));Visual(go,null,water.w/100,h/100,3).color=new Color(.1f,.6f,.8f,.6f);Box(go,water.w/100,h/100,true);var zone=go.AddComponent<FarolRespawnZone>();zone.useLocalPosition=water.respawn!=null;if(water.respawn!=null)zone.safePosition=FarolCoordinates.Point(water.respawn.x,water.respawn.y);Source(go,c.sector,"water",water);
                }
                foreach(var enemy in Items(c.enemies)) {
                    bool monkey=enemy.type=="monkey";var go=Node(monkey?"Macaco":"Caranguejo",root,FarolCoordinates.Point(enemy.x,enemy.y==0?GroundY(c,enemy.x,ground):enemy.y));go.layer=9;Visual(go,monkey?"monkey/f000":"crab/f000",0,0,17);go.AddComponent<Animator>().runtimeAnimatorController=controller;
                    var box=Box(go,monkey?.9f:.7f,monkey?1.5f:.5f);box.offset=Vector2.up*(monkey?.75f:.25f);
                    var rb=go.AddComponent<Rigidbody2D>();rb.freezeRotation=true;rb.gravityScale=monkey?0:18f/9.81f;if(monkey)rb.bodyType=RigidbodyType2D.Kinematic;
                    var brain=go.AddComponent<FarolEnemy>();brain.monkey=monkey;brain.minX=enemy.minX/100;brain.maxX=enemy.maxX/100;brain.player=player;Source(go,c.sector,"enemies",enemy,true,"Validar comportamento original; arremesso do macaco e animações de combate ainda pendentes.");
                }
                foreach(var f in Items(c.waterfalls)){var go=Node("Cachoeira",root,FarolCoordinates.RectCenter(f.x,f.y,f.w,f.h));Visual(go,"waterfall/f000",f.w/100,f.h/100,26);go.AddComponent<Animator>().runtimeAnimatorController=controller;go.AddComponent<FarolPose>().animationName="waterfall.loop";Source(go,c.sector,"waterfalls",f,true,"Portar transparência atrás da cortina e segredo.");}
                foreach(var trigger in Items(c.triggers))TriggerPreview(root,c,trigger,ground);
                foreach(var rope in Items(c.ropes))RopeMarker(root,c.sector,rope);
                foreach(var secret in Items(c.secrets))Marker(root,c.sector,"secrets",secret,"Portar revelação, cobertura e farejo do Faísca.");
                foreach(var hint in Items(c.hints))Marker(root,c.sector,"hints",hint,"Conectar à interface de dicas.");
                foreach(var wave in Items(c.waveHits))Marker(root,c.sector,"waveHits",wave,"Portar impacto das ondas.");
                foreach(var orb in Items(c.energyOrbs))Marker(root,c.sector,"energyOrbs",orb,"Portar recarga do especial e brilho.");
                foreach(var relic in Items(c.relics))Marker(root,c.sector,"relics",relic,"Usar a chave ARTEFATO_ESPIRAL, preservando o evento de história.");
            }
            string result=output+"/Fase3_Ilha.unity";EditorSceneManager.SaveScene(SceneManager.GetActiveScene(),result);return result;
        }

        static void Background(SectorData s,Transform parent)
        {
            foreach(var layer in s.layers) {
                string key=layer.sprite;if(string.IsNullOrEmpty(key)&&layer.n==0)key=layer.fallbackKey;
                if(!Art(key))continue;
                var go=new GameObject("Fundo camada "+layer.n);go.transform.SetParent(parent,false);var p=go.AddComponent<FarolParallaxLayer>();p.cameraTransform=camera.transform;p.player=player.transform;p.factor=layer.factor;p.x0=s.x0/100;p.x1=s.x1/100;
                Sprite image=Art(key);float scale=10.8f/image.bounds.size.y;p.width=image.bounds.size.x*scale;
                int count=Mathf.Clamp(Mathf.CeilToInt(19.2f/p.width)+3,3,32);p.panels=new SpriteRenderer[count];
                for(int i=0;i<count;i++){var panel=Node("Painel "+i,go.transform,new Vector3(s.x0/100+(i-count/2)*p.width,5.4f));var sr=Visual(panel,key,0,0,layer.n<4?-50+layer.n*5:25+layer.n);sr.color=new Color(1,1,1,layer.alpha>0?layer.alpha:1);panel.transform.localScale=Vector3.one*scale;p.panels[i]=sr;sr.enabled=s.id=="A";}
            }
        }

        static void Pickup(Transform parent,string sector,MapItem item,string art,int value)
        {var go=Node("Concha "+item.id,parent,FarolCoordinates.Point(item.x,item.y));var sr=Visual(go,art,.42f,.42f,22);if(item.gold)sr.color=new Color(1,.8f,.2f);Box(go,.55f,.55f,true);var pickup=go.AddComponent<FarolPickup>();pickup.id=item.id;pickup.value=value;Source(go,sector,"shells",item);}
        static void Checkpoint(Transform parent,string sector,MapItem item,float ground)
        {var go=Node("Checkpoint "+item.id,parent,FarolCoordinates.Point(item.x,ground-65));Visual(go,"checkpoint/f000",.7f,1.3f,8);Box(go,1,2,true);var cp=go.AddComponent<FarolCheckpoint>();cp.spawn=FarolCoordinates.Point(item.x,ground-4);cp.activeSprite=Art("checkpoint/f001");Source(go,sector,"checkpoints",item);}
        static void Marker(Transform parent,string sector,string category,MapItem item,string note)
        {var go=Node(category+" — "+(item.id??"marcador"),parent,FarolCoordinates.Point(item.x,item.y));Source(go,sector,category,item,true,note);}
        static void RopeMarker(Transform parent,string sector,MapItem item)
        {var go=Node("Corda — portabilidade pendente",parent,FarolCoordinates.Point(item.ropeX,(item.topY+item.bottomY)/2));Visual(go,"rope/f000",.35f,Mathf.Max(.3f,(item.bottomY-item.topY)/100),12);Source(go,sector,"ropes",item,true,"Portar agarrar, subir, balanço e salto de saída.");}

        static void TriggerPreview(Transform parent,ChunkData chunk,MapItem item,float ground)
        {
            Marker(parent,chunk.sector,"triggers",item,"Portar evento "+item.@event+" usando a referência JavaScript preservada.");
            string key=null,pose=null;float x=item.x,y=ground;
            if(item.@event=="helpZoneToninho"){key="toninho_rope/f000";pose="toninho.idle";x=item.toninhoX;y=item.topY;RopeMarker(parent,chunk.sector,item);}
            if(item.@event=="helpZoneMarina"){key="marina_push/f000";pose="marina.idle";x=item.crateTargetX;y=item.crateTargetY;}
            if(item.@event=="helpZoneJulia"){key="julia_camera/f000";pose="julia.idle";x=item.juliaX;y=item.juliaY;}
            if(item.@event=="helpZoneLucas"){key="lucas_device/f000";pose="lucas.idle";x=item.lucasX;y=item.lucasY;}
            // A Bia é a protagonista; não gerar outro NPC Bia na rota secreta.
            if(key!=null){var npc=Node("Ajuda — "+pose,parent,FarolCoordinates.Point(x,y));Visual(npc,key,0,0,18);npc.AddComponent<Animator>().runtimeAnimatorController=controller;npc.AddComponent<FarolPose>().animationName=pose;Source(npc,chunk.sector,"helper",item,true,"Animação de repouso disponível; interação narrativa pendente.");}
            foreach(var buoy in Items(item.buoys)){var go=Node("Boia do Lucas",parent,FarolCoordinates.RectCenter(buoy.x,buoy.y,buoy.w,58));Visual(go,"floating_platforms/f000",buoy.w/100,.58f,9);var box=Box(go,buoy.w/100,.25f);box.offset=Vector2.up*.165f;var eff=go.AddComponent<PlatformEffector2D>();eff.useOneWay=true;box.usedByEffector=true;go.AddComponent<Rigidbody2D>().bodyType=RigidbodyType2D.Kinematic;var moving=go.AddComponent<FarolMovingPlatform>();moving.amplitude=Vector2.up*buoy.oscAmp/100;Source(go,chunk.sector,"buoy",buoy,true,"Portar ativação pelo Lucas e afundamento com peso.");}
            foreach(var platform in Items(item.secretPlatforms)){var go=Solid(parent,chunk.sector,platform,platform.y,32,true);go.name="Plataforma secreta — revelação pendente";go.GetComponent<FarolSourceMarker>().requiresPort=true;}
        }

        static string BuildVillage()
        {
            var village=JsonUtility.FromJson<VillageData>(File.ReadAllText(Data+"fase1.json"));StartScene("fase1",village.width,FarolCoordinates.Point(village.spawn.x,village.spawn.y),false);
            var root=new GameObject("Vila — mapa de origem").transform;
            foreach(var item in Items(village.colliders))Solid(root,"A",item,item.y,item.h,false);
            foreach(var item in Items(village.obstacles))Solid(root,"A",item,item.y,item.h,false);
            foreach(var shell in Items(village.shells))Pickup(root,"vila",shell,"shell",shell.gold?5:1);
            foreach(var cp in Items(village.checkpoints))Checkpoint(root,"vila",cp,village.groundY);
            foreach(var prop in Items(village.props))Marker(root,"vila","props",prop,"Associar textura e comportamento da Vila.");
            Source(root.gameObject,"vila","stage",village,true,"Geometria e conchas importadas. Portar narrativa, NPCs, animações HD, áudio e transição para o barco.");
            string result=output+"/Fase1_Vila_Base.unity";EditorSceneManager.SaveScene(SceneManager.GetActiveScene(),result);return result;
        }
    }
}
