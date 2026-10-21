using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolRespawnZone : MonoBehaviour
    {
        public Vector2 safePosition;public bool useLocalPosition;
        void OnTriggerEnter2D(Collider2D c){var p=c.GetComponent<FarolPlayerController>();if(!p)return;if(useLocalPosition){var checkpoint=p.respawnPosition;p.Teleport(safePosition);p.respawnPosition=checkpoint;}else p.Respawn();}
    }
}
