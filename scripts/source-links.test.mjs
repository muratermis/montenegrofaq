import test from 'node:test';import assert from 'node:assert/strict';import {sourceReferralUrl,outboundReferralUrl,attributeOutboundLinks} from './source-links.mjs';
test('source attribution preserves existing query parameters and fragments',()=>{const url=new URL(sourceReferralUrl('https://example.com/reference.pdf?lang=en#page=3'));assert.equal(url.searchParams.get('lang'),'en');assert.equal(url.hash,'#page=3');assert.equal(url.searchParams.get('utm_source'),'montenegrofaq.org');assert.equal(url.searchParams.get('utm_medium'),'referral');assert.equal(url.searchParams.get('utm_campaign'),'source_reference');assert.equal(sourceReferralUrl(url.href),url.href);});

test('all external web destinations receive attribution without changing internal or contact links',()=>{
 for(const input of ['https://bemu.me','https://github.com/muratermis/montenegrofaq','https://google.com/maps/search/?api=1&query=Kotor%20Montenegro#map','//example.com/path']){
  const result=outboundReferralUrl(input),url=new URL(result);
  assert.equal(url.searchParams.get('utm_source'),'montenegrofaq.org');
  assert.equal(url.searchParams.get('utm_medium'),'referral');
  assert.equal(outboundReferralUrl(result),result);
 }
 const map=new URL(outboundReferralUrl('https://google.com/maps/search/?api=1&query=Kotor%20Montenegro#map'));
 assert.equal(map.searchParams.get('query'),'Kotor Montenegro');assert.equal(map.hash,'#map');
 for(const input of ['/nl/kotor/','#sources','https://montenegrofaq.org/tr/','https://montefaq.org/nfc/','tel:112','mailto:hello@example.com'])assert.equal(outboundReferralUrl(input),input);
});
test('HTML attribution covers anchors while leaving canonical URLs, structured data and assets intact',()=>{
 const html=attributeOutboundLinks('<!doctype html><html><head><link rel="canonical" href="https://montenegrofaq.org/en/"><script type="application/ld+json">{"url":"https://bemu.me"}</script></head><body><a href="https://bemu.me">BEMU</a><a href="/en/">Home</a><img src="https://example.com/photo.jpg"></body></html>');
 assert.match(html,/<a href="https:\/\/bemu.me\/\?utm_source=montenegrofaq.org/);
 assert.ok(html.includes('<link rel="canonical" href="https://montenegrofaq.org/en/">'));
 assert.ok(html.includes('{"url":"https://bemu.me"}'));
 assert.ok(html.includes('<a href="/en/">'));
 assert.ok(html.includes('src="https://example.com/photo.jpg"'));
});
