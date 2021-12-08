const container = document.getElementById("root");
const ajax = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store = {
  currentPage: 1,
  feeds: [],
};

function getData(url) {
  ajax.open("GET", url, false);
  ajax.send();

  return JSON.parse(ajax.response);
}

function checkFeeds(feeds) {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function newsFeed() {
  let newsFeed = store.feeds;
  const newsList = [];
  let template = `
  <div class="bg-gray-600 min-h-screen">
    <div class="bg-white text-xl">
      <div class="mx-auto px-4">
        <div class="flex justify-between items-center py-6">
          <div class="flex justify-start">
            <h1 class="font-extrabold">Hacker News</h1>
          </div>
          <div class="items-center justify-end">
            <a href="#/page/{{prev_page}}" class="text-gray-500">
              Previous
            </a>
            <a href="#/page/{{next_page}}" class="text-gray-500 ml-4">
              Next
            </a>
          </div>
        </div>
      </div>
    </div>
    <div class="p-4 text-2xl text-gray-700">
    {{news_feed}}
    </div>
  </div>
`;

  if (!newsFeed.length) {
    newsFeed = store.feeds = checkFeed(getData(NEWS_URL));
    // =을 두번 사용하면 맨 오른쪽에 있는 데이터가 왼쪽에 한 번 들어가고 후에 제일 왼쪽에 들어가게 됨
    // 같은 데이터를 연속으로 넣어줄 수 있다
  }

  for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; i++) {
    newsList.push(`
    <div class="p-6 ${
      newsFeed[i].read ? "bg-green-500" : "bg-white"
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${
            newsFeed[i].comments_count
          }</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class="grid grid-cols-3 text-sm text-gray-500">
          <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
          <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
          <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
        </div>
      </div>
    </div>
  `);
  }

  template = template.replace("{{news_feed}}", newsList.join(""));
  template = template.replace(
    "{{prev_page}}",
    store.currentPage > 1 ? store.currentPage - 1 : 1
  );
  template = template.replace("{{next_page}}", store.currentPage + 1);

  container.innerHTML = template;
}

function newsDetail() {
  const id = location.hash.substr(7);
  const newsContents = getData(CONTENT_URL.replace("@id", id));
  let template = `
  <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContents.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContents.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;

  for (let i = 0; i < store.feeds.length; i++) {
    if (store.feeds[i].id === Number(id)) {
      store.feeds[i].read = true;
      break;
    }
  }
  function displayComment(comments, count = 0) {
    const commentList = [];

    for (let i = 0; i < comments.length; i++) {
      commentList.push(`
      <div style="padding-left: ${count * 40}px;" class="mt-4">
      <div class="text-gray-400">
        <i class="fa fa-sort-up mr-2"></i>
        <strong>${comments[i].user}</strong> ${comments[i].time_ago}
      </div>
      <p class="text-gray-700">${comments[i].content}</p>
    </div>
      `);

      if (comments[i].comments.length) {
        commentList.push(displayComment(comments[i].comments, count++));
      }
    }

    return commentList.join("");
  }
  container.innerHTML = template.replace(
    "{{__comments__}}",
    displayComment(newsContents, comments)
  );
}

function router() {
  const routePath = location.hash;

  if (routePath === "") {
    newsFeed();
  } else if (routePath.indexOf("#/page/") >= 0) {
    store.currentPage = Number(routePath.substr(7));
    newsFeed();
  } else {
    newsDetail();
  }
}

window.addEventListener("hashchange", router, false);

router();
