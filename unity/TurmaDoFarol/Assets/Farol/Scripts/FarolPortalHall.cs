using System;
using UnityEngine;
namespace TurmaDoFarol
{
    public sealed class FarolPortalHall : MonoBehaviour
    {
        [Serializable] public class Door {public string id;public Transform point;public SpriteRenderer glass,padlock,ring;public TextMesh price;}
        public Door[] doors;public Transform lens;FarolCampaign campaign;
        void Start(){campaign=GetComponent<FarolCampaign>();campaign.checkpoint=new Vector2(8.3f,2.84f);campaign.player.Teleport(campaign.checkpoint);if(campaign.progress!=null)Refresh();}
        void Update()
        {
            if(!campaign||campaign.progress==null)return;Refresh();
            if(campaign.paused)return;if(Input.GetKeyDown(KeyCode.Tab))campaign.TogglePortalList();
            if(campaign.PortalOverlayOpen)return;
            Door nearest=null;float best=1.9f;foreach(var door in doors){float dx=Mathf.Abs(door.point.position.x-campaign.player.transform.position.x),dy=Mathf.Abs(door.point.position.y-campaign.player.transform.position.y);if(dy<1.2f&&dx<best){nearest=door;best=dx;}}
            campaign.Prompt(nearest==null?"Tab · Lista de portais":"E · "+PortalName(nearest.id)+"   ·   Tab: lista");
            if(nearest!=null&&Input.GetKeyDown(KeyCode.E)){campaign.OpenPortals();campaign.SelectPortal(nearest.id);}
            if(lens)lens.Rotate(0,0,12*Time.deltaTime);
        }
        string PortalName(string id){foreach(var p in campaign.assets.Data["portals"])if((string)p["id"]==id)return (string)p["nome"];return id;}
        void Refresh(){foreach(var door in doors){bool open=campaign.PortalOpen(door.id);if(door.glass)door.glass.enabled=!open;if(door.padlock)door.padlock.enabled=!open;if(door.ring)door.ring.enabled=open;if(door.price){string text=campaign.PortalStatus(door.id);if(door.price.text!=text)door.price.text=text;}}}
    }
}
