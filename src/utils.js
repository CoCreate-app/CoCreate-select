export function parse(text) {
  let doc = new DOMParser().parseFromString(text, "text/html");
  if (doc.head.children[0]) return doc.head.children[0];
  else return doc.body.children[0];
}

export function addAttribute(containerSelector, att) {
  return containerSelector.split(',').map(s => s.trim() + att).join(', ')
}
