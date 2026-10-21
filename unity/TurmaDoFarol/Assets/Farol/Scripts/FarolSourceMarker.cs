using UnityEngine;

namespace TurmaDoFarol
{
    // Mantém as informações não portadas acessíveis no Inspector.
    public sealed class FarolSourceMarker : MonoBehaviour
    {
        public string sector, category, sourceId;
        public bool requiresPort;
        [TextArea(2,14)] public string originalJson;
        [TextArea(2,6)] public string nextStep;
    }
}
