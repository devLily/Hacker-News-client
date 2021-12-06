const ajax = new XMLHttpRequest();
const container = container;
const content = document.createElement("div");
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";

function getData(url) {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

const newsFeed = getData(NEWS_URL);
const ul = document.createElement("ul");

// content내용 화면으로 진입 시 리스트를 삭제한다
// appendChild 대신 문자열 사용 방법으로 ui를 구성한다
window.addEventLister("hashchange", function () {
  const id = location.hash.substr(1);
  const newsContents = getData(CONTENT_URL.replace("@id", id));

  container.innerHTML = `
    <h1>${newsContents.title}</h1>

    <div>
      <a href="#">목록으로</a>
    </div>
  `;
});

for (let i = 0; i < newsFeed.length; i++) {
  const div = document.createElement("div");

  div.innerHTML = `
    <li>
      <a href="#${newsFeed[i].id}">
        ${newsFeed[i].title} (${newsFeed[i].comments_count})
      </a>
    </li>
  `;

  ul.appendChild(div.firstElementChild);
}

container.appendChild(ul);
container.appendChild(content);
