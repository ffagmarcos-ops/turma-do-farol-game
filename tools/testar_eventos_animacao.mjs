import test from 'node:test';
import assert from 'node:assert/strict';
import { AnimationEvents } from '../src/game/fase3/AnimationEvents.js';

test('executa na ordem do manifesto temporal, mesmo com salto de quadros, uma vez', () => {
  const events = [
    { animationKey: 'bia.throw_stand', atMs: 300, action: 'release' },
    { animationKey: 'bia.throw_stand', atMs: 0, action: 'start' },
    { animationKey: 'other', atMs: 50, action: 'ignore' },
    { animationKey: 'bia.throw_stand', atMs: 100, action: 'prepare' },
  ];
  const before = structuredClone(events);
  const fired = [];
  const clock = new AnimationEvents({ animationEvents: events }, e => fired.push(e.action));
  clock.start('bia.throw_stand');
  assert.deepEqual(fired, ['start']);
  clock.advance(99);
  assert.deepEqual(fired, ['start']);
  clock.advance(401);
  assert.deepEqual(fired, ['start', 'prepare', 'release']);
  clock.advance(500);
  assert.deepEqual(fired, ['start', 'prepare', 'release']);
  assert.deepEqual(events, before, 'não reordena nem remove eventos do manifesto');
});

test('cancelar impede eventos pendentes e reiniciar repõe o relógio', () => {
  const fired = [];
  const clock = new AnimationEvents({ animationEvents: [
    { animationKey: 'action', atMs: 100, action: 'release' },
  ] }, e => fired.push(e.action));
  clock.start('action');
  clock.advance(50);
  clock.cancel();
  clock.advance(1000);
  assert.deepEqual(fired, []);
  clock.start('action');
  clock.advance(99);
  assert.deepEqual(fired, []);
  clock.advance(1);
  assert.deepEqual(fired, ['release']);
});

test('trocar a animação descarta eventos da ação anterior', () => {
  const fired = [];
  const clock = new AnimationEvents({ animationEvents: [
    { animationKey: 'old', atMs: 100, action: 'old' },
    { animationKey: 'new', atMs: 200, action: 'new' },
  ] }, e => fired.push(e.action));
  clock.start('old');
  clock.advance(50);
  clock.start('new');
  clock.advance(200);
  assert.deepEqual(fired, ['new']);
});

test('aceita manifesto ausente ou animação sem eventos', () => {
  for (const manifest of [null, {}, { animationEvents: [] }]) {
    const clock = new AnimationEvents(manifest, () => assert.fail('evento inesperado'));
    clock.start('missing');
    clock.advance(1000);
    clock.cancel();
  }
});
