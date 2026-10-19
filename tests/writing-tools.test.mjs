import test from 'node:test';
import assert from 'node:assert/strict';
import {codePaste,detectCodeLanguage,renderNoteText,indentationEdit} from '../public/writing-tools.js';
const apply=(value,edit)=>value.slice(0,edit.start)+edit.text+value.slice(edit.end);

test('code paste recognizes source without treating explanations, existing fences, or diagnostics as code',()=>{
  const source='fn main() {\r\n    println!("Hi");\r\n}\r\n';
  assert.equal(codePaste(source),'```rust\nfn main() {\n    println!("Hi");\n}\n```');
  assert.equal(detectCodeLanguage('def greet(name):\n    print(name)'),'python');
  assert.equal(detectCodeLanguage('[package]\nname = "practice"'),'toml');
  assert.equal(detectCodeLanguage('show_session(page_name);'),'rust');
  assert.equal(codePaste('let is the keyword; the name follows it.'),null);
  for(const prose of ['I think true changes the value, not the type.','The function prints a name.\nThen execution returns to main.','```rust\nfn main() {}\n```','PS C:\\practice> cargo run\nFinished dev profile','error[E0425]: cannot find value'])assert.equal(codePaste(prose),null);
});

test('mixed notes retain prose and render fenced source as escaped code, including unknown language labels',()=>{
  const html=renderNoteText('My prediction.\n\n```rust\nprintln!("<script>&");\n```\n\nWhat I observed.');
  assert.match(html,/My prediction/);assert.match(html,/What I observed/);
  assert.match(html,/data-code-file="pasted.rs"/);assert.match(html,/&lt;script&gt;&amp;/);assert.doesNotMatch(html,/<script>/);
  assert.match(renderNoteText('```constructor\n<script>alert(1)</script>\n```'),/data-code-file="pasted.txt"/);
  assert.match(renderNoteText('fn main() {\n    println!("Hi");\n}'),/data-code-file="pasted.rs"/);
});

test('Tab inserts at the cursor and selected-line indentation preserves the original selection content',()=>{
  const value='let name = "Rust";';const edit=indentationEdit(value,4,4);
  assert.equal(apply(value,edit),'let     name = "Rust";');assert.equal(edit.selectionStart,8);
  const multi='first\nsecond\nthird',selected=indentationEdit(multi,0,13);
  assert.equal(apply(multi,selected),'    first\n    second\nthird');
  assert.equal(selected.selectionStart,4);assert.equal(selected.selectionEnd,21);
  const restored=indentationEdit(apply(multi,selected),selected.selectionStart,selected.selectionEnd,true);
  assert.equal(apply(apply(multi,selected),restored),multi);
});

test('Shift+Tab removes one indentation level and never removes non-whitespace text',()=>{
  for(const value of ['    one\n  two\n\tthree','one\ntwo']){
    const edit=indentationEdit(value,0,value.length,true);
    assert.equal(apply(value,edit),value==='one\ntwo'?value:'one\ntwo\nthree');
  }
  const cursor=indentationEdit('    word',2,2,true);
  assert.equal(apply('    word',cursor),'word');assert.equal(cursor.selectionStart,0);
});
