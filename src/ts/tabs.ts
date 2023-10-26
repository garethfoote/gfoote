export class Tabs {
  private tabs: HTMLElement[];
  private panels: HTMLElement[];

  constructor(root: HTMLElement) {
    this.tabs = Array.from(root.querySelectorAll("[role=tablist] [role=tab]"));
    this.panels = []
  }

  initialise: () => void = () => {
    this.tabs.forEach((tab:HTMLElement) => {
      const panelName : string = tab.getAttribute('aria-controls')!;
      const panel = document.getElementById(panelName)!;
      
      tab.tabIndex = -1
      tab.setAttribute('aria-selected', 'false');
      this.panels.push(panel);

      tab.addEventListener('keydown', this.onKeydown);
      tab.addEventListener('click', this.onClick);  
    })

    this.setSelectedTab(this.tabs[0], false);
  };

  setSelectedTab: (tab: HTMLElement, setFocus?:boolean) => void = (
    tab, 
    setFocus=true
  ) => {
    const panel:HTMLElement|undefined = this.panels.find((p)=> tab.getAttribute("aria-controls") === p.id);

    if(!panel) return;

    tab.setAttribute('aria-selected', 'true');
    tab.tabIndex = 0;
    tab.parentElement?.classList.add('tabs__list-item--selected');
    panel.classList.remove('tabs__panel--hidden');

    this.tabs.forEach((t, i)=>{
      if(tab != t){
        t.setAttribute('aria-selected', 'false');
        t.parentElement?.classList.remove('tabs__list-item--selected');
        t.tabIndex = -1;
        this.panels[i].classList.add('tabs__panel--hidden');
      }
    })

    if(setFocus == true){
      tab.focus();
    }
  }

  onClick: (e: MouseEvent) => void = (e) => {
    this.setSelectedTab(e.currentTarget as HTMLElement)
    e.preventDefault();
  }

  onKeydown: (e: KeyboardEvent) => void = (e) => {
    console.log(e.key,  e.currentTarget);

    switch (e.key) {
      case 'ArrowLeft':
        // this.setSelectedToPreviousTab(tgt);
        break;

      case 'ArrowRight':
        // this.setSelectedToNextTab(tgt);
        break;

      case 'Home':
        // this.setSelectedTab(this.firstTab);
        break;

      case 'End':
        // this.setSelectedTab(this.lastTab);
        break;

      default:
        break;
    }
  }
}
  