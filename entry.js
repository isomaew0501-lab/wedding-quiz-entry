const params=new URLSearchParams(location.hash.slice(1));
const supplied=params.get('invite');
if(supplied&&/^[a-f0-9]{48}$/.test(supplied)){sessionStorage.setItem('wedding-entry-invite',supplied);history.replaceState(null,'',location.pathname+location.search);}
const invite=sessionStorage.getItem('wedding-entry-invite')??'';
const status=document.getElementById('status'),message=document.getElementById('message'),join=document.getElementById('join'),indicator=document.getElementById('indicator'),retry=document.getElementById('retry');
let busy=false;
async function check(){
 if(busy)return;busy=true;retry.disabled=true;join.hidden=true;join.removeAttribute('href');indicator.classList.remove('ready');
 if(!/^[a-f0-9]{48}$/.test(invite)){status.textContent='テーブルのQRコードを読み込んでください';message.textContent='参加用のキーを確認できませんでした。会場に置かれたQRコードから開き直してください。';busy=false;retry.disabled=false;return;}
 try{
  status.textContent='接続先を確認しています…';
  const response=await fetch(`connection.json?t=${Date.now()}`,{cache:'no-store',signal:AbortSignal.timeout(8000)});if(!response.ok)throw Error('接続先未設定');
  const config=await response.json();if(!config.active)throw Error('受付前');const destination=new URL(config.url);
  if(destination.protocol!=='https:'||!destination.hostname.endsWith('.trycloudflare.com')||destination.username||destination.password||destination.port||destination.pathname!=='/'||destination.search||destination.hash)throw Error('接続先不正');
  const health=await fetch(`${destination.origin}/health`,{cache:'no-store',signal:AbortSignal.timeout(7000)});if(!health.ok||(await health.json()).ready!==true)throw Error('停止中');
  join.href=`${destination.origin}/?view=player#invite=${invite}`;join.hidden=false;indicator.classList.add('ready');status.textContent='参加できます';message.textContent='下のボタンからクイズへお進みください。';
 }catch{status.textContent='受付開始までお待ちください';message.textContent='司会者が準備中です。この画面は約15秒ごとに確認します。接続先を更新した直後は、反映まで時間がかかることがあります。';}
 finally{busy=false;retry.disabled=false;}
}
retry.addEventListener('click',check);check();setInterval(check,15000);
