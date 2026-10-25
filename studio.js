(function () {
  'use strict';
  const C = window.PortfolioConfig;
  const base = C.clone(window.PORTFOLIO_CONFIG);
  const storageKey = 'becky-portfolio-studio-v1';
  const looksKey = storageKey + '-looks';
  let state = C.clone(base);
  let history = [];
  let saveTimer;
  let activeTab = 'design';
  let writingGroup = 'Introduction';
  let template = '';
  let looks = [];
  let loadWarning = '';
  let previewReady = false;
  const panel = document.getElementById('panel');
  const frame = document.getElementById('preview');
  const status = document.getElementById('save-status');
  const previewStatus = document.getElementById('preview-status');
  const compare = document.getElementById('compare');
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved) state = C.normalize(JSON.parse(saved), base);
    const savedLooks = JSON.parse(localStorage.getItem(looksKey) || '[]');
    if (Array.isArray(savedLooks)) looks = savedLooks.slice(0, 8).map(look => ({name:String(look.name).slice(0,60),config:C.normalize(look.config,base)}));
  } catch { loadWarning = 'Browser storage is unavailable or a saved draft could not be read. Use a backup to keep your edits.'; }

  function el(tag, text, attrs = {}) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
    return node;
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      try { localStorage.setItem(storageKey, JSON.stringify(state)); status.textContent = 'Draft saved in this browser · Not published'; }
      catch { status.textContent = 'Draft is in memory only. Save an editable backup before closing.'; }
    }, 250);
  }
  function preview(jump) {
    if (!previewReady) return;
    frame.contentWindow.postMessage({type:'portfolio:preview',config:compare.checked ? base : state,jump}, location.origin === 'null' ? '*' : location.origin);
  }
  function change(mutator, options = {}) {
    history.push(C.clone(state));
    if (history.length > 35) history.shift();
    mutator(state);
    state = C.normalize(state, base);
    document.getElementById('undo').disabled = false;
    if (compare.checked) compare.checked = false;
    preview(options.jump);
    save();
    if (options.render) render();
  }
  function field(parent, label, value, type, onChange, attrs = {}) {
    const wrap = el('label', label);
    const node = el(type === 'textarea' ? 'textarea' : 'input', undefined, {...attrs});
    if (type !== 'textarea') node.type = type;
    else node.rows = value.length > 170 ? 5 : 3;
    node.value = value;
    node.addEventListener(type === 'file' ? 'change' : 'input', () => onChange(node.value, node));
    wrap.append(node); parent.append(wrap); return node;
  }
  function select(parent, label, value, choices, onChange) {
    const wrap = el('label',label); const node = el('select');
    for (const [key, name] of choices) { const option = el('option',name,{value:key}); option.selected = key === value; node.append(option); }
    node.addEventListener('change', () => onChange(node.value)); wrap.append(node);parent.append(wrap);return node;
  }
  function button(parent, label, action, attrs = {}) {
    const node = el('button',label,{type:'button',...attrs});node.addEventListener('click',action);parent.append(node);return node;
  }
  function check(parent, label, value, action) {
    const wrap = el('label',undefined,{class:'check-label'}); const input = el('input',undefined,{type:'checkbox'});input.checked=value;input.addEventListener('change',()=>action(input.checked));wrap.append(input,document.createTextNode(label));parent.append(wrap);
  }
  const layoutChoices = [['editorial','Text beside the visual'],['visual-first','Visual first'],['stacked','Full-width story']];
  const presets = {
    Notebook: {paper:'#f1efdf',ink:'#263e35',accent:'#a23e26',voice:'#e4e8d8',tea:'#263e35',circuit:'#e4e8d8',stitch:'#e7decc',about:'#e4e8d8',displayFont:'workshop',bodyFont:'system',scale:90,spacing:80,hero:'shelf-first',index:'list',layout:'stacked',surfaces:'paper'},
    Cabinet: {paper:'#f7f3e9',ink:'#542d40',accent:'#c65330',voice:'#e8ddeb',tea:'#542d40',circuit:'#e4e8d8',stitch:'#eadfd8',about:'#e7e9d8',displayFont:'book',bodyFont:'humanist',scale:100,spacing:100,hero:'split',index:'questions',layout:'editorial',surfaces:'color'},
    Gallery: {paper:'#ffffff',ink:'#202020',accent:'#1b48b0',voice:'#e8edff',tea:'#202020',circuit:'#eeeeee',stitch:'#f0f0ed',about:'#eeeeee',displayFont:'plain',bodyFont:'system',scale:110,spacing:110,hero:'centered',index:'list',layout:'visual-first',surfaces:'paper'}
  };
  function contrast(a,b) {
    const lum = hex => { const c = hex.slice(1).match(/../g).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return c[0]*.2126+c[1]*.7152+c[2]*.0722; };
    const x=lum(a),y=lum(b);return ((Math.max(x,y)+.05)/(Math.min(x,y)+.05)).toFixed(1);
  }
  function renderDesign() {
    panel.append(el('h2','Make it feel like you.'),el('p','Start with a direction, then change the parts. Presets change the design—not your writing or images.'));
    const grid = el('div',undefined,{class:'preset-grid'});panel.append(grid);
    for (const [name, design] of Object.entries(presets)) button(grid,name,()=>change(s=>Object.assign(s.design,design),{render:true,jump:'main'}));
    panel.append(el('h3','Type & rhythm'));
    select(panel,'Headline type',state.design.displayFont,[['book','Bookish serif'],['workshop','Workshop monospace'],['plain','Direct sans serif'],['classic','Classic Georgia']],value=>change(s=>s.design.displayFont=value));
    select(panel,'Body type',state.design.bodyFont,[['humanist','Warm humanist'],['system','System sans serif'],['mono','Monospace']],value=>change(s=>s.design.bodyFont=value));
    for (const [key,title,min,max,step,unit] of [['scale','Headline size',75,125,5,'%'],['spacing','Space between sections',65,140,5,'%'],['width','Maximum page width',900,1500,20,'px']]) {
      const wrap=el('label');const row=el('span',undefined,{class:'range-label'});const output=el('output',state.design[key]+unit);row.append(el('span',title),output);const input=el('input',undefined,{type:'range',min,max,step,'aria-label':title});input.value=state.design[key];input.addEventListener('input',()=>{output.textContent=input.value+unit;change(s=>s.design[key]=Number(input.value));});wrap.append(row,input);panel.append(wrap);
    }
    panel.append(el('h3','Color palette'));
    const colorGrid=el('div',undefined,{class:'color-grid'});panel.append(colorGrid);
    const labels={paper:'Page',ink:'Text',accent:'Accent',voice:'Voice panel',tea:'Tea panel',circuit:'Circuit panel',stitch:'Embroidery',about:'About'};
    const contrastLine=el('p',undefined,{class:'help'});
    function updateContrast(){const ratio=contrast(state.design.ink,state.design.paper);contrastLine.textContent=`Page text contrast: ${ratio}:1${Number(ratio)<4.5?' · Try more separation for small text.':' · Good for normal text.'}`;}
    for(const key of C.colors)field(colorGrid,labels[key],state.design[key],'color',value=>{change(s=>s.design[key]=value);updateContrast();});
    updateContrast();panel.append(contrastLine);
    panel.append(el('h3','Information & composition'));
    select(panel,'Opening composition',state.design.hero,[['split','Words, then cabinet'],['shelf-first','Cabinet, then words'],['centered','Centered introduction']],value=>change(s=>s.design.hero=value,{jump:'main'}));
    check(panel,'Show the original tea shelf',state.design.showShelf,value=>change(s=>s.design.showShelf=value,{jump:'main'}));
    select(panel,'Project index',state.design.index,[['questions','Question cards'],['list','Compact contents list'],['hidden','Go straight to the projects']],value=>change(s=>s.design.index=value));
    select(panel,'Default project layout',state.design.layout,layoutChoices,value=>change(s=>s.design.layout=value));
    select(panel,'Project details',state.design.details,[['collapsed','Expandable details'],['expanded','Read everything on the page']],value=>change(s=>s.design.details=value));
    select(panel,'Section backgrounds',state.design.surfaces,[['color','Colored sections'],['paper','Mostly paper']],value=>change(s=>s.design.surfaces=value));
  }
  function renderWriting() {
    panel.append(el('h2','Your words, in one place.'),el('p','Change the headlines and descriptions directly. Line breaks are preserved. HTML stays plain text.'));
    const groups=[...new Set(state.copy.map(item=>item.group))];
    select(panel,'Section to edit',writingGroup,groups.map(group=>[group,group]),value=>{writingGroup=value;render();const project=state.projects.find(p=>p.name===value);preview(project?.id || (value==='Introduction'?'main':value==='Other work'?'more-work':'about'));});
    for(const item of state.copy.filter(item=>item.group===writingGroup))field(panel,item.label,item.value,'textarea',value=>change(s=>s.copy.find(copy=>copy.id===item.id).value=value));
    if(writingGroup==='About & contact'){
      panel.append(el('h3','Outbound links'));
      for(const link of state.links)field(panel,link.label,link.url,'url',(value,node)=>{
        node.setCustomValidity(C.safeLink(value)?'':'Use an https://, http://, or mailto: address.');
        if(C.safeLink(value))change(s=>s.links.find(item=>item.id===link.id).url=value);
      });
    }
  }
  function renderProjects() {
    panel.append(el('h2','Tell the story your way.'),el('p','Move projects, change their layout, or replace a sketch with your own image. Hiding a project also hides its index link.'));
    state.projects.forEach((project,index)=>{
      const card=el('article',undefined,{class:'project-card'});card.append(el('h3',`${index+1}. ${project.name}`));
      const row=el('div',undefined,{class:'reorder'});card.append(row);
      const move=direction=>change(s=>{const next=index+direction;[s.projects[index],s.projects[next]]=[s.projects[next],s.projects[index]];},{render:true,jump:project.id});
      button(row,'↑ Move up',()=>move(-1),{'aria-label':`Move ${project.name} up`}).disabled=index===0;
      button(row,'↓ Move down',()=>move(1),{'aria-label':`Move ${project.name} down`}).disabled=index===state.projects.length-1;
      check(card,'Show this project',project.visible,value=>change(s=>s.projects.find(p=>p.id===project.id).visible=value));
      button(card,'Show in preview ↗',()=>preview(project.id),{class:'jump'});
      select(card,'Layout',project.layout,[['inherit','Use the default layout'],...layoutChoices],value=>change(s=>s.projects.find(p=>p.id===project.id).layout=value,{jump:project.id}));
      const details=el('details');details.append(el('summary','Project image'));card.append(details);
      let altInput;
      const imageInfo=el('p',project.image?'A custom image is in use. Upload another to replace it.':'Currently using the original illustration or repository asset. PNG, JPEG, WebP, or GIF; up to 4 MB.');
      const uploadLabel=el('label','Replace the visual');const upload=el('input',undefined,{type:'file',accept:'image/png,image/jpeg,image/webp,image/gif','aria-label':`Upload image for ${project.name}`});uploadLabel.append(upload);details.append(uploadLabel);
      upload.addEventListener('change',async()=>{
        const file=upload.files[0];if(!file)return;
        if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>4*1024*1024){status.textContent='Choose a PNG, JPEG, WebP, or GIF image under 4 MB.';return;}
        try {
          const image=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file);});
          change(s=>{const p=s.projects.find(p=>p.id===project.id);p.image=image;if(!p.alt)p.alt=project.name+' project image';},{jump:project.id});
          altInput.value=state.projects.find(p=>p.id===project.id).alt;
          imageInfo.textContent='A custom image is in use. Upload another to replace it.';
          status.textContent='Image added. Add a useful description and caption below.';
        }catch{status.textContent='That image could not be read. Try another file.';}
      });
      details.append(imageInfo);
      altInput=field(details,'Image description (for accessibility)',project.alt,'textarea',value=>change(s=>s.projects.find(p=>p.id===project.id).alt=value));
      field(details,'Visible caption',project.caption,'textarea',value=>change(s=>s.projects.find(p=>p.id===project.id).caption=value));
      button(details,'Restore original visual',()=>change(s=>s.projects.find(p=>p.id===project.id).image='',{render:true,jump:project.id}));
      panel.append(card);
    });
  }
  function render() {
    panel.replaceChildren();
    ({design:renderDesign,writing:renderWriting,projects:renderProjects})[activeTab]();
  }
  document.querySelectorAll('[data-tab]').forEach(button=>button.addEventListener('click',()=>{activeTab=button.dataset.tab;document.querySelectorAll('[data-tab]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));render();}));
  document.querySelectorAll('[data-width]').forEach(button=>button.addEventListener('click',()=>{frame.style.width=button.dataset.width;document.querySelectorAll('[data-width]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}));
  compare.addEventListener('change',()=>{preview();previewStatus.textContent=compare.checked?'Original version — your draft is preserved.':'Live draft — not published.';});
  document.getElementById('undo').addEventListener('click',()=>{if(!history.length)return;state=history.pop();document.getElementById('undo').disabled=!history.length;compare.checked=false;render();preview();save();});
  document.getElementById('reset').addEventListener('click',()=>change(()=>{state=C.clone(base);},{render:true,jump:'main'}));
  function download(name,content,type) {
    const url=URL.createObjectURL(new Blob([content],{type}));const a=el('a',undefined,{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
  }
  document.getElementById('download-backup').addEventListener('click',()=>{download('becky-portfolio-backup.json',JSON.stringify(state,null,2),'application/json');status.textContent='Editable backup downloaded. Keep it to restore this draft.';});
  document.getElementById('download-config').addEventListener('click',()=>{download('portfolio.config.js',C.script(state),'text/javascript');status.textContent='Settings downloaded. Replace portfolio.config.js on your review branch to apply them.';});
  async function bundledTemplate() {
    if(window.PORTFOLIO_TEMPLATE)return window.PORTFOLIO_TEMPLATE;
    const response=await fetch('index.html');if(!response.ok)throw new Error('Page could not be loaded');
    const doc=new DOMParser().parseFromString(await response.text(),'text/html');
    async function dataUrl(path){const res=await fetch(path);if(!res.ok)throw new Error('Missing '+path);const blob=await res.blob();return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});}
    const css=await Promise.all([...doc.querySelectorAll('link[rel="stylesheet"]')].map(async node=>{const res=await fetch(node.getAttribute('href'));if(!res.ok)throw new Error('Styles missing');const style=doc.createElement('style');style.textContent=await res.text();node.replaceWith(style);}));
    for(const node of [...doc.querySelectorAll('script[src]')]){
      const path=node.getAttribute('src');const res=await fetch(path);if(!res.ok)throw new Error('Script missing');const script=doc.createElement('script');script.textContent=(await res.text()).replace(/<\/script/gi,'<\\/script');
      if(path==='portfolio.config.js')script.id='portfolio-config';node.remove();doc.body.append(script);
    }
    await Promise.all([...doc.querySelectorAll('img[src],link[rel="icon"]')].map(async node=>{const attr=node.tagName==='IMG'?'src':'href';node.setAttribute(attr,await dataUrl(node.getAttribute(attr)));}));
    return '<!doctype html>\n'+doc.documentElement.outerHTML;
  }
  function htmlWithConfig(config) {
    const doc=new DOMParser().parseFromString(template,'text/html');
    const node=doc.getElementById('portfolio-config');if(!node)throw new Error('Configuration missing from preview');node.textContent=C.script(config);
    return '<!doctype html>\n'+doc.documentElement.outerHTML;
  }
  document.getElementById('download-site').addEventListener('click',()=>{
    try { if(!template)throw new Error('Wait for the preview');download('becky-button-portfolio.html',htmlWithConfig(state),'text/html');status.textContent='Website downloaded with your edits and images. This does not publish it.'; }
    catch {status.textContent='The preview is still loading. Please try the download again when it appears.';}
  });
  function refreshLooks(){const select=document.getElementById('saved-looks');select.replaceChildren(el('option','Choose a saved look…',{value:''}));looks.forEach((look,index)=>select.append(el('option',look.name,{value:index})));}
  document.getElementById('save-look').addEventListener('click',()=>{
    const name=document.getElementById('look-name').value.trim();if(!name){status.textContent='Give this look a name first.';return;}
    const next=looks.filter(look=>look.name!==name);next.push({name,config:C.clone(state)});
    if(next.length>8){status.textContent='Eight looks are already saved. Reuse a name to replace one, or download a backup.';return;}
    try{localStorage.setItem(looksKey,JSON.stringify(next));looks=next;refreshLooks();status.textContent='Saved look: '+name;}catch{status.textContent='Browser storage is full or unavailable. Save an editable backup instead.';}
  });
  document.getElementById('load-look').addEventListener('click',()=>{const value=document.getElementById('saved-looks').value;if(value==='')return;change(()=>{state=C.normalize(looks[Number(value)].config,base);},{render:true,jump:'main'});});
  document.getElementById('import-backup').addEventListener('change',async event=>{
    const file=event.target.files[0];if(!file)return;
    try{if(file.size>26000000)throw new Error('Backup too large');const next=C.normalize(JSON.parse(await file.text()),base);change(()=>{state=next;},{render:true,jump:'main'});status.textContent='Backup restored. Your previous draft is available through Undo.';}catch{status.textContent='Could not import that file. Choose a portfolio JSON backup under 26 MB.';}finally{event.target.value='';}
  });
  frame.addEventListener('load',()=>{previewReady=true;preview();previewStatus.textContent='Live draft — changes stay local until you export.';});
  render();refreshLooks();status.textContent=loadWarning || 'Draft loaded · Changes stay local, never auto-published';
  bundledTemplate().then(html=>{template=html;frame.srcdoc=htmlWithConfig(state);}).catch(()=>{previewStatus.textContent='Open the standalone studio file, or serve this folder locally. The source editor needs its files to be available.';});
})();
