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

// api 호출 코드의 중복
// ajax.open("GET", NEWS_URL, false);
// ajax.send();

const newsFeed = getData(NEWS_URL);
const ul = document.createElement("ul");

window.addEventLister("hashchange", function () {
  const id = location.hash.substr(1);
  // ajax.open("GET", CONTENT_URL.replace("@id", id), false);
  // ajax.send();

  const newsContents = getData(CONTENT_URL.replace("@id", id));
  const title = document.createElement("h1");

  title.innerHTML = newsContents.title;
  content.appendChild(title);
});

// DOM API 최소한으로 사용하기
// for (let i = 0; i < newsFeed.length; i++) {
//   const li = document.createElement("li");
//   const a = document.createElement("a");

//   a.href = `#${newsFeed[i].id}`;
//   a.innerHTML = `${newsFeed[i].title} (${newsFeed[i].comments_count})`;

//   li.appendChild(a);
//   ul.appendChild(li);
// }

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
