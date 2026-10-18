// Portable defaults. No editor profile or system settings are read.
export const fontFamily="'Cascadia Code', Consolas, 'Liberation Mono', monospace";
export const theme={base:'vs-dark',inherit:true,colors:{'editor.background':'#1e1e1e'},rules:[]};

export function languageForFile(name=''){
  const extension=name.split('.').at(-1).toLowerCase();
  return ({rs:'rust',py:'python',toml:'ini',ini:'ini',cfg:'ini',json:'json',sh:'shell',ps1:'powershell',md:'markdown'})[extension] || 'plaintext';
}
