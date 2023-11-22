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

  setSelectedToPreviousTab: (currentTab: HTMLElement) => void = (currentTab) => {
    var index;
    const firstTab = this.tabs[0]
    if (currentTab === firstTab) {
      this.setSelectedTab(firstTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.setSelectedTab(this.tabs[index - 1]);
    }
  }

  setSelectedToNextTab: (currentTab: HTMLElement) => void = (currentTab) => {
    var index;
    const lastTab = this.tabs.slice(-1)[0]
    if (currentTab === lastTab) {
      this.setSelectedTab(lastTab);
    } else {
      index = this.tabs.indexOf(currentTab);
      this.setSelectedTab(this.tabs[index + 1]);
    }
  }

  onClick: (e: MouseEvent) => void = (e) => {
    this.setSelectedTab(e.currentTarget as HTMLElement)
    e.preventDefault();
  }

  stopEvent: (e: KeyboardEvent) => void = (e) => {
    e.stopPropagation();
    e.preventDefault();
  }

  onKeydown: (e: KeyboardEvent) => void = (e) => {
    const tgt:HTMLElement|null = e.currentTarget as HTMLElement;

    switch (e.key) {
      case 'ArrowLeft':
        if(tgt){
          this.setSelectedToPreviousTab(tgt);
        }
        this.stopEvent(e)
        break;
      case 'ArrowRight':
        if(tgt){
          this.setSelectedToNextTab(tgt);
        }
        this.stopEvent(e)
        break;
      case 'Home':
        this.setSelectedTab(this.tabs[0]);
        this.stopEvent(e);
        break;
      case 'End':
        this.setSelectedTab(this.tabs[this.tabs.length-1]);
        this.stopEvent(e)
        break;

      default:
        break;
    }
  }
}
  