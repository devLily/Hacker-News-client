# Hacker-News-client

make hacker news client by javascript and migrate to typescript

## 프로젝트의 목적

- JavaScript로 먼저 프로젝트를 작성해보고 TypeScript로 변환하면서 각 언어를 확실히 이해하고 활용.
- tailwind CSS

## 프로젝트의 과정

- 전달되는 데이터에 따라 동적으로 화면을 구성하는 과정에서 리팩토링을 반복하며 여러 방법으로 코드를 작성하고 그 장 단점을 파악한다.
- js로 가장 먼저 뼈대 코드를 작성하고 목적에 따른 코드 분리, 중복 코드 제거 등을 다양한 방법으로 리팩토링한다.
- javascript로 구현한 프로젝트를 Typescript로 변수부터 함수까지 차례로 마이그레이션하는 과정에서 타입 표기방식별로 코드를 작성해보고,
  그 과정에서 필요한 여러 TypeScript 문법 등을 적용하여 계속해서 다양한 방법으로 여러 가지 코드를 작성한다.
  (과정은 commit log를 통해 확인 가능)
- app.ts에서 관리하는 소스코드를 분리하여 코드의 구조를 개선하고 유지보수를 용이하게 한다.

### UI

createElement vs template 방식

- 장점: 템플릿을 사용하여 해당 ui의 명확한 구조를 확인할 수 있고 데이터가 들어갈 위치도 확인할 수 있다
- 단점 : template 안에 마킹된 데이터가 많으면 많을 수록 데이터를 replace하기 위한 반복적인 코드가 늘어난다.
  ex) handlebars - template library

### Type 표기

Type Alias 와 Interface 방식은 제공되는 기능은 거의 유사하나 문법적인 차이가 존재한다.
보통 확장성이 높은 형식의 타입을 표기 할 때 Interface 방식을 사용

Type Alias

- 객체 유형을 대입하는 듯한 표기 방법
- Union type, intersection type 지원

Interface

- 유형에 대한 설명을 명시적으로 표기
- 교차 타입과 같은 유형은 extends 지원

### Generics

함수가 리턴하는 값의 타입이 여러가지일 경우 분기처리로만 type을 가드하는 것은 쉽지 않으므로 Generics을 사용한다.
입력이 n개의 유형일 때 출력 또한 n개의 유형인 것을 정의하는 것

### 상속

1. Class를 사용하여 상속 매커니즘 구현
2. Mixin을 사용하여 상속 매커니즘 구현
