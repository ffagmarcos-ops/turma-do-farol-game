using System;
using UnityEngine;

namespace TurmaDoFarol
{
    // Dados exportados: coordenadas de origem em pixels, com Y para baixo.
    [Serializable] public class FarolCatalog { public SheetData[] sheets; public SpriteData[] sprites; public ClipData[] animations; public ImageData[] images; }
    [Serializable] public class SheetData { public string path; public float pixelsPerUnit; public SpriteRectData[] frames; }
    [Serializable] public class SpriteRectData { public string name, guid; public int x,y,w,h; public float pivotX,pivotY; }
    [Serializable] public class SpriteData { public string id,path,name; public bool multiple; }
    [Serializable] public class ClipData { public string key; public float fps,duration; public bool loop; public ClipFrame[] frames; }
    [Serializable] public class ClipFrame { public string sprite; public float time; }
    [Serializable] public class ImageData { public string key,sprite; }
    [Serializable] public class FarolMap { public string sourceCommit; public float length; public SectorData[] sectors; public ChunkData[] chunks; public TileData[] tiles; public PropData[] props; }
    [Serializable] public class TileData { public string sector,key,sprite; }
    [Serializable] public class PropData : TileData { public float w,h; }
    [Serializable] public class LayerData { public int n; public string sprite,fallbackKey; public float factor,alpha=1; }
    [Serializable] public class SectorData { public string id,name,art; public float x0,x1,groundY; public LayerData[] layers; }
    [Serializable] public class PointData { public float x,y; }
    [Serializable] public class MoveData { public string axis; public float range,period,phase; }
    [Serializable] public class MapItem
    {
        public string id,kind,type,tiles,text;
        public string @event;
        public float x,y,w,h,scale=1,minX,maxX,toninhoX,ropeX,topY,bottomY,marinaX,marinaY,crateStartX,crateTargetX,crateY,juliaX,juliaY,lucasX,lucasY,biaX,biaY;
        public float oscAmp,sinkDepth,sniffX,period,phase,amp,moveX,moveY,speed,crateStartY,crateTargetY;
        public bool gold,flip,front,crumble,slippery,sway;
        public PointData respawn;
        public MoveData move;
        public MapItem zone,cover;
        public MapItem[] buoys,secretPlatforms;
    }
    [Serializable] public class ChunkData
    {
        public string id,sector,art; public float x0,x1;
        public MapItem[] ground,blocks,platforms,decor,shells,checkpoints,hints,enemies,water,secrets,waveHits,triggers,ropes,breakables,waterfalls,energyOrbs,relics;
    }
    [Serializable] public class VillageData
    {
        public float width,groundY; public PointData spawn;
        public MapItem[] colliders,obstacles,props,shells,checkpoints;
    }
    public static class FarolCoordinates
    {
        public const float PPU=100;
        public static Vector3 Point(float x,float y) => new Vector3(x/PPU,(1080-y)/PPU,0);
        public static Vector3 RectCenter(float x,float y,float w,float h) => Point(x+w/2,y+h/2);
    }
}
