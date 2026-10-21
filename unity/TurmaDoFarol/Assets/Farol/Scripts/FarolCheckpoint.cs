using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolCheckpoint : MonoBehaviour
    {
        public Vector2 spawn;public Sprite activeSprite;bool activated;
        void OnTriggerEnter2D(Collider2D c){if(activated||!c.GetComponent<FarolPlayerController>())return;activated=true;if(FarolGameSession.Instance)FarolGameSession.Instance.Checkpoint(spawn);var sr=GetComponent<SpriteRenderer>();if(sr&&activeSprite)sr.sprite=activeSprite;}
    }
}
