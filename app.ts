interface Store {
  currentPage: number;
  feeds: NewsFeed[];
}

interface News {
  id: number;
  time_ago: string;
  title: string;
  url: string;
  user: string;
  content: string;
}

interface NewsFeed extends News {
  comments_count: number;
  points: number;
  read?: boolean;
}

interface NewsDetail extends News {
  comments: NewsComment[];
}

interface NewsComment extends News {
  comments: NewsComment[];
  level: number;
}

const container: HTMLElement | null = document.getElementById("root");
const ajax: XMLHttpRequest = new XMLHttpRequest();
const NEWS_URL = "https://api.hnpwa.com/v0/news/1.json";
const CONTENT_URL = "https://api.hnpwa.com/v0/item/@id.json";
const store: Store = {
  currentPage: 1,
  feeds: [],
};

function applyApiMixins(targetClass: any, baseClasses: any[]): void {
  baseClasses.forEach((baseClass) => {
    Object.getOwnPropertyNames(baseClass.prototype).forEach((name) => {
      const descriptor = Object.getOwnPropertyDescriptor(
        baseClass.prototype,
        name
      );

      if (descriptor) {
        Object.defineProperty(targetClass.prototype, name, descriptor);
      }
    });
  });
}
class Api {
  getRequest<AjaxResponse>(url: string): AjaxResponse {
    const ajax = new XMLHttpRequest();
    ajax.open("GET", url, false);
    ajax.send();

    return JSON.parse(ajax.response);
  }
}

// 상위 class에 있는 메서드 혹은 특성들은 인스턴스 객체를 통해 접근할 수 있음
class NewsFeedApi {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL);
    // getRequest는 제네릭을 명시해 주어야 함
  }
}

class NewsDetailApi {
  getData(id: string): NewsDetail {
    return this.getRequest<NewsDetail>(CONTENT_URL.replace("@id", id));
  }
}

interface NewsFeedApi extends Api {}
interface NewsDetailApi extends Api {}

applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

function checkFeeds(feeds: NewsFeed[]): NewsFeed[] {
  for (let i = 0; i < feeds.length; i++) {
    feeds[i].read = false;
  }

  return feeds;
}

function updateView(html: string): void {
  if (container) {
    container.innerHTML = html;
  } else {
    console.error(
      "최상위 컨테이너가 존재하지 않으므로 UI를 진행할 수 없습니다"
    );
  }
}

function newsFeed(): void {
  const api = new NewsFeedApi();
  let newsFeed: NewsFeed[] = store.feeds;
  const newsList: string[] = [];
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
    newsFeed = store.feeds = checkFeeds(api.getData());
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
    String(store.currentPage > 1 ? store.currentPage - 1 : 1)
  );
  template = template.replace("{{next_page}}", String(store.currentPage + 1));

  updateView(template);
}

function newsDetail(): void {
  const id = location.hash.substr(7);
  const api = new NewsDetailApi();
  const newsDetail: NewsDetail = api.getData(id);
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
        <h2>${newsDetail.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsDetail.content}
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

  updateView(
    template.replace("{{__comments__}}", displayComment(newsDetail.comments))
  );
}

function displayComment(comments: NewsComment[]): string {
  const commentList = [];

  for (let i = 0; i < comments.length; i++) {
    const comment: NewsComment = comments[i];
    commentList.push(`
    <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
    <div class="text-gray-400">
      <i class="fa fa-sort-up mr-2"></i>
      <strong>${comment.user}</strong> ${comment.time_ago}
    </div>
    <p class="text-gray-700">${comment.content}</p>
  </div>
    `);

    if (comment.comments.length) {
      commentList.push(displayComment(comment.comments));
    }
  }

  return commentList.join("");
}

function router(): void {
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
