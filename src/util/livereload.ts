const getEtag = () =>
  fetch("./js/spelldata.js", { method: "HEAD" }).then((r) =>
    r.headers.get("etag")
  );
const init = await getEtag();
setInterval(async () => await getEtag() !== init && location.reload(), 250);
