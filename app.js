const STORAGE_KEY = 'techOfertasProductsV1';
const CATEGORY_EMOJIS = {Mouses:'🖱️', Teclados:'⌨️', 'Áudio':'🎧', Acessórios:'🎮', Informática:'💻', Monitores:'🖥️', Outros:'📦'};
const VALID_CATEGORIES = Object.keys(CATEGORY_EMOJIS);
function validHttpUrl(value) { try { const u = new URL(value); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } }
function normalizeProduct(p) {return {id:String(p.id||''),name:String(p.name||''),category:VALID_CATEGORIES.includes(p.category)?p.category:'Outros',description:String(p.description||''),image:validHttpUrl(p.image||''),url:validHttpUrl(p.url||''),tag:String(p.tag||'').slice(0,40)};}
async function loadProducts() {
  const preview = localStorage.getItem(STORAGE_KEY);
  if (preview) {try { const parsed=JSON.parse(preview);if(Array.isArray(parsed)) return parsed.map(normalizeProduct); }catch{}}
  try {const resp=await fetch('products.json',{cache:'no-store'});if(!resp.ok)throw Error();const data=await resp.json();return Array.isArray(data)?data.map(normalizeProduct):[];}catch{return [];}
}
function element(tag,cls,text){const el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}
function renderCatalog(products){
 const root=document.getElementById('product-list'),categories=document.getElementById('categories'),search=document.getElementById('search'),count=document.getElementById('result-count'),empty=document.getElementById('empty');
 let active='Todos';
 function addCategories(){categories.replaceChildren();const catList=['Todos',...new Set(products.map(p=>p.category))];for(const c of catList){const b=element('button','category-btn'+(active===c?' active':''),c);b.type='button';b.onclick=()=>{active=c;addCategories();draw();};categories.append(b);}}
 function draw(){const query=search.value.trim().toLocaleLowerCase('pt-BR');const filtered=products.filter(p=>(active==='Todos'||p.category===active)&&(p.name+' '+p.description+' '+p.category).toLocaleLowerCase('pt-BR').includes(query));root.replaceChildren();count.textContent=`${filtered.length} produto${filtered.length===1?'':'s'}`;empty.hidden=!!filtered.length;
 for(const p of filtered){const card=element('article','product-card'),picture=element('div','product-picture');
 if(p.image){const img=document.createElement('img');img.src=p.image;img.alt=p.name;img.loading='lazy';img.onerror=()=>{img.remove();picture.append(element('span','product-emoji',CATEGORY_EMOJIS[p.category]));};picture.append(img);}else{picture.append(element('span','product-emoji',CATEGORY_EMOJIS[p.category]));}
 if(p.tag)picture.append(element('span','product-tag',p.tag));
 const body=element('div','product-body');body.append(element('div','product-category',p.category),element('h3','',p.name),element('p','',p.description));
 if(p.url){const a=element('a','product-link','Ver produto ↗');a.href=p.url;a.target='_blank';a.rel='noopener noreferrer sponsored';a.setAttribute('aria-label',`Ver ${p.name} na loja parceira`);body.append(a);}else{const a=element('span','product-link disabled','Link em breve');body.append(a);}card.append(picture,body);root.append(card);}}
 search.addEventListener('input',draw);addCategories();draw();
}
document.addEventListener('DOMContentLoaded',async()=>renderCatalog(await loadProducts()));
