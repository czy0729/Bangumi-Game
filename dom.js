$('#browserItemList li h3').each((a, b) => {
  const k = $(b).find('a').text()
  const href = $(b).find('a').attr('href')
  $('<br />').appendTo(b)
  $(
    `<a href="https://www.vgtime.com/search/list.jhtml?keyword=${k}" target="_blank" style="cursor: pointer">[vg]</a>`
  ).appendTo(b)
  $(
    `<a onclick="
      navigator.clipboard.readText()
      .then(text => {
        navigator.clipboard.writeText('node v ' + text + ' https://bgm.tv${href}')
      });
    " style="margin-left: 8px; cursor: pointer">[copy]</a>`
  ).appendTo(b)
  $('<br />').appendTo(b)
  $(
    `<a href="https://game.tgbus.com/search?q=${k}" target="_blank" style="margin-left: 8px; cursor: pointer">[tgbus]</a>`
  ).appendTo(b)
  $(
    `<a onclick="
      navigator.clipboard.readText()
      .then(text => {
        navigator.clipboard.writeText('https://bgm.tv${href}')
      });
    " style="margin-left: 8px; cursor: pointer">[bgm]</a>`
  ).appendTo(b)
})
