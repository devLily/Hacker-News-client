# Hacker-News-client

make hacker news client by javascript and migrate to typescript

## 프로젝트의 목적

- JavaScript로 먼저 프로젝트를 작성해보고 TypeScript로 변환하면서 각 언어를 확실히 이해하고 활용.
- tailwind CSS

## 프로젝트의 과정

- 전달되는 데이터에 따라 동적으로 화면을 구성하는 과정에서 리팩토링을 반복하며 여러 방법의 장 단점을 파악한다.
- 템플릿 방식을 사용하는 것
  장점: 템플릿을 사용하여 해당 ui의 명확한 구조를 확인할 수 있고 데이터가 들어갈 위치도 확인할 수 있다
  단점 : template 안에 마킹된 데이터가 많으면 많을 수록 데이터를 replace하기 위한 반복적인 코드가 늘어난다.

ex) handlebars - template library

- 목적에 의해 코드를 분리하는 작업
