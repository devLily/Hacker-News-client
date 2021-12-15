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

interface RouteItem {
  path: string;
  page: View;
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

class NewsFeedApi {
  getData(): NewsFeed[] {
    return this.getRequest<NewsFeed[]>(NEWS_URL);
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

abstract class View {
  private template: string;
  private renderTemplate: string;
  private container: HTMLElement;
  private htmlElementList: string[];

  constructor(containerId: string, template: string) {
    const containerElement = document.getElementById(containerId);
    // getElementById는 null을 반환할 수 있기 때문에 에러처리를 위해 변수로 선언해서 따로 빼줌

    if (!containerElement) {
      throw "최상위 컨테이너가 존재하지 않아 UI작업을 진행할 수 없습니다.";
    }

    this.container = containerElement;
    this.template = template;
    this.renderTemplate = template;
    this.htmlElementList = [];
  }

  protected updateView(): void {
    this.container.innerHTML = this.renderTemplate;
    this.renderTemplate = this.template;
  }

  protected addHtmlElement(htmlString: string): void {
    this.htmlElementList.push(htmlString);
  }

  protected getHtmlElement(): string {
    const snpaShot = this.htmlElementList.join("");
    this.initializedElementList();
    return snpaShot;
  }

  protected setTemplate(key: string, value: string): void {
    this.renderTemplate = this.template.replace(`{{__${key}__}}`, value);
  }

  private initializedElementList(): void {
    this.htmlElementList = [];
  }

  abstract render(): void;
  // 추상 메서드
}

class Router {
  routeTable: RouteItem[];
  defaultRoute: RouteItem | null;

  constructor() {
    window.addEventListener("hashchange", this.route.bind(this));
    // 브라우저의 이벤트 시스템이 this.route를 호출

    this.routeTable = [];
    this.defaultRoute = null;
  }

  setDefaultPage(page: View): void {
    this.defaultRoute = { path: "", page };
  }

  addRoutePath(path: string, page: View): void {
    this.routeTable.push({
      path: path,
      page: page,
    });
  }

  route() {
    const routePath = location.hash;

    if (!routePath && this.defaultRoute) {
      this.defaultRoute.page.render();
    }

    for (const routeItem of this.routeTable) {
      if (routePath.indexOf(routeItem.path) >= 0) {
        routeItem.page.render();
        break;
      }
    }
  }
}
class NewsFeedView extends View {
  private api: NewsFeedApi;
  private feeds: NewsFeed[];

  constructor(containerId: string) {
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
    super(containerId, template);

    this.api = new NewsFeedApi();
    this.feeds = store.feeds;

    if (!this.feeds.length) {
      this.feeds = store.feeds = this.api.getData();
      this.checkFeeds();
    }
  }

  render(): void {
    store.currentPage = Number(location.hash.substr(7) || 1);

    for (
      let i = (store.currentPage - 1) * 10;
      i < store.currentPage * 10;
      i++
    ) {
      const { id, title, comments_count, user, points, time_ago, read } =
        this.feeds[i];
      this.addHtmlElement(`
    <div class="p-6 ${
      read ? "bg-green-500" : "bg-white"
    } mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
      <div class="flex">
        <div class="flex-auto">
          <a href="#/show/${id}">${title}</a>
        </div>
        <div class="text-center text-sm">
          <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
        </div>
      </div>
      <div class="flex mt-3">
        <div class="grid grid-cols-3 text-sm text-gray-500">
          <div><i class="fas fa-user mr-1"></i>${user}</div>
          <div><i class="fas fa-heart mr-1"></i>${points}</div>
          <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
        </div>
      </div>
    </div>
  `);
    }

    this.setTemplate("news_feed", this.getHtmlElement());
    this.setTemplate(
      "prev_page",
      String(store.currentPage > 1 ? store.currentPage - 1 : 1)
    );
    this.setTemplate("next_page", String(store.currentPage + 1));

    this.updateView();
  }

  private checkFeeds(): void {
    for (let i = 0; i < this.feeds.length; i++) {
      this.feeds[i].read = false;
    }
  }
}

class NewsDetailView extends View {
  constructor(containerId: string) {
    let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
        <div class="bg-white text-xl">
          <div class="mx-auto px-4">
            <div class="flex justify-between items-center py-6">
              <div class="flex justify-start">
                <h1 class="font-extrabold">Hacker News</h1>
              </div>
              <div class="items-center justify-end">
                <a href="#/page/{{__currentPage__}}" class="text-gray-500">
                  <i class="fa fa-times"></i>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div class="h-full border rounded-xl bg-white m-6 p-4 ">
          <h2>{{__title__}}</h2>
          <div class="text-gray-400 h-20">
          {{__content__}}
          </div>

          {{__comments__}}

        </div>
      </div>
    `;

    super(containerId, template);
  }

  render() {
    const id = location.hash.substr(7);
    const api = new NewsDetailApi();
    const newsDetail: NewsDetail = api.getData(id);

    for (let i = 0; i < store.feeds.length; i++) {
      if (store.feeds[i].id === Number(id)) {
        store.feeds[i].read = true;
        break;
      }
    }

    this.setTemplate("comments", this.displayComment(newsDetail.comments));
    this.setTemplate("currentPage", String(store.currentPage));
    this.setTemplate("title", newsDetail.title);
    this.setTemplate("content", newsDetail.content);

    this.updateView();
  }

  displayComment(comments: NewsComment[]): string {
    for (let i = 0; i < comments.length; i++) {
      const comment: NewsComment = comments[i];

      this.addHtmlElement(`
      <div style="padding-left: ${comment.level * 40}px;" class="mt-4">
      <div class="text-gray-400">
        <i class="fa fa-sort-up mr-2"></i>
        <strong>${comment.user}</strong> ${comment.time_ago}
      </div>
      <p class="text-gray-700">${comment.content}</p>
    </div>
      `);

      if (comment.comments.length) {
        this.addHtmlElement(this.displayComment(comment.comments));
      }
    }

    return this.getHtmlElement();
  }
}

function newsDetail(): void {}

const router: Router = new Router();
const newsFeedView = new NewsFeedView("root");
const newsDetailview = new NewsDetailView("root");

router.setDefaultPage(newsFeedView);
router.addRoutePath("/page/", newsFeedView);
router.addRoutePath("/show/", newsDetailview);

router.route();
