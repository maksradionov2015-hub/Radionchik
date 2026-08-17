# «Спектр» — техническое задание для разработки (для AI-агента)
### Версия 1. Дополняет продуктовый документ `Spektr_TZ_funkcional_i_arhitektura_v1.md` — тот файл описывает бизнес-правила, контент и клиническую логику; этот файл описывает, как это реализовать в коде

**Как использовать оба документа вместе:** продуктовый файл — источник истины по контенту упражнений, формулировкам и бизнес-правилам. Этот файл — источник истины по структуре данных, API, алгоритмам и порядку реализации. При конфликте формулировок бизнес-логики приоритет у продуктового файла; при конфликте по структуре кода — у этого.

---

## 1. Технологический стек (зафиксированные решения)

Решения ниже — не варианты на выбор, а конкретные технологии для реализации. Причины указаны там, где выбор неочевиден.

| Слой | Технология | Причина |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript + Tailwind CSS, PWA (`next-pwa`) | Один кодбейз для веба и «псевдо-нативной» установки на телефон без немедленного релиза в App Store/Google Play |
| Backend | NestJS (Node.js + TypeScript) | Модульная архитектура 1:1 соответствует доменным модулям ниже; TS сквозной с фронтом |
| БД | PostgreSQL 15+ | Реляционная модель хорошо ложится на строго типизированные сущности (диагностика, токены, бронирования) |
| Кеш/очереди | Redis | Сессии, rate-limiting, отложенные джобы (напоминания о чек-инах) |
| ORM | Prisma | Типобезопасность, миграции, читаемая схема (см. раздел 2) |
| Файловое хранилище | S3-совместимое (аудио для guided-упражнений) | — |
| LLM-провайдер | Anthropic API (Claude) | Используется для трёх изолированных задач: NLP-анализ контекста, скрининг безопасности, персонализация шаблонов (см. раздел 4.4–4.5) — **три раздельных вызова с разными системными промптами, не один общий** |
| Платежи | ЮKassa API | Подписка, разовая оплата консультаций, сплит-выплаты психологам |
| Аутентификация | JWT (access + refresh) + OTP по телефону/email | — |
| Хостинг | **Российский облачный провайдер** (Yandex Cloud / VK Cloud / Selectel) | Персональные данные о здоровье граждан РФ по 152-ФЗ и 242-ФЗ обязаны первично записываться и храниться на серверах на территории РФ. Это архитектурное требование с первого дня — миграция инфраструктуры постфактум существенно дороже |
| CI/CD | GitHub Actions (или self-hosted аналог, если требуется локализация репозитория — уточнить отдельно) | — |
| Мониторинг | Sentry (ошибки) + структурированные логи с маскированием чувствительных полей | См. раздел 6 |

---

## 2. Схема данных (Prisma)

```prisma
enum Role { USER PSYCHOLOGIST CONTENT_CURATOR ADMIN }
enum ConsentType { PERSONAL_DATA HEALTH_DATA TERMS_OF_SERVICE MARKETING }
enum DiagnosticType { FLEXIBILITY VALUES }
enum RiskLevel { NONE LOW MODERATE HIGH UNKNOWN }
enum ReviewStatus { PENDING REVIEWED ESCALATED }
enum HexaflexProcess { ACCEPTANCE DEFUSION PRESENT_MOMENT SELF_AS_CONTEXT VALUES COMMITTED_ACTION }
enum ExerciseFormat {
  WORD_OF_DAY CATCH_AND_NAME SORTING CHOOSE_REACTION REFRAME MATCHING
  TIMED_PRACTICE SCALE MICRO_EXPERIMENT VIGNETTE VALUES_CARD_SORT
  METAPHOR_BUILDER CHECKPOINT_QUIZ
}
enum ProgressStatus { NOT_STARTED IN_PROGRESS COMPLETED AWAITING_CHECKIN }
enum TokenReason { EXERCISE_COMPLETED CHECKIN_BONUS SUBSCRIPTION_STIPEND CONSULTATION_REDEMPTION ADMIN_ADJUSTMENT }
enum SubscriptionStatus { TRIAL ACTIVE PAST_DUE CANCELED }
enum VerificationStatus { PENDING APPROVED REJECTED }
enum BookingStatus { SCHEDULED COMPLETED CANCELED NO_SHOW }

model User {
  id                String   @id @default(uuid())
  name              String
  age               Int
  isMinor           Boolean  @default(false)
  gender            String?
  email             String?  @unique
  phone             String?  @unique
  passwordHash      String?
  role              Role     @default(USER)
  tokenBalance      Int      @default(0)
  createdAt         DateTime @default(now())

  consents          Consent[]
  diagnostics       DiagnosticResult[]
  contextProfile    ContextProfile?
  progress          UserProgress[]
  tokenTransactions TokenTransaction[]
  subscription      Subscription?
  bookings          Booking[]
  notifications     Notification[]
}

model Consent {
  id          String       @id @default(uuid())
  userId      String
  user        User         @relation(fields: [userId], references: [id])
  type        ConsentType
  textVersion String
  grantedAt   DateTime     @default(now())
}

model DiagnosticResult {
  id                String            @id @default(uuid())
  userId            String
  user              User              @relation(fields: [userId], references: [id])
  type              DiagnosticType
  version           Int               @default(1)
  rawAnswers        Json              // хранить в зашифрованном виде (application-level AES-256)
  computedAt        DateTime          @default(now())
  flexibilityScore  FlexibilityScore?
  valuesEntries     ValuesEntry[]
}

model FlexibilityScore {
  id                  String            @id @default(uuid())
  diagnosticResultId  String            @unique
  diagnosticResult    DiagnosticResult  @relation(fields: [diagnosticResultId], references: [id])
  acceptance          Float
  defusion            Float
  presentMoment       Float
  selfAsContext       Float
  values              Float
  committedAction     Float
  composite           Float
}

model ValuesEntry {
  id                  String            @id @default(uuid())
  diagnosticResultId  String
  diagnosticResult    DiagnosticResult  @relation(fields: [diagnosticResultId], references: [id])
  domain              String            // один из 13 доменов, см. продуктовый ТЗ раздел 6.2
  textAnswer          String            @db.Text // шифровать
  importance          Int               // 1-10
  consistency         Int               // 1-10
  gap                 Int               // = importance - consistency, вычисляется на бэкенде
}

model ContextProfile {
  id                String      @id @default(uuid())
  userId            String      @unique
  user              User        @relation(fields: [userId], references: [id])
  rawText           String      @db.Text // шифровать
  domainsMentioned  String[]
  fusionMarkers     String[]
  avoidanceMarkers  String[]
  plianceMarkers    String[]
  safetyFlag        SafetyFlag?
  createdAt         DateTime    @default(now())
}

model SafetyFlag {
  id                String        @id @default(uuid())
  contextProfileId  String        @unique
  contextProfile    ContextProfile @relation(fields: [contextProfileId], references: [id])
  riskLevel         RiskLevel
  triggeredAt       DateTime      @default(now())
  reviewStatus      ReviewStatus  @default(PENDING)
  reviewedByUserId  String?
}

model Exercise {
  id                       String          @id @default(uuid())
  process                  HexaflexProcess
  branchLevel              Int
  format                   ExerciseFormat
  title                    String
  bodyTemplate             String          @db.Text  // содержит {{slot}}-плейсхолдеры
  allowedSlots             String[]        // whitelist слотов для персонализации, см. 4.4
  contentBankRefs          String[]
  tokenReward              Int
  estimatedMinutes         Int
  requiresRealLifeCheckIn  Boolean         @default(false)
  checkInDelayHours        Int?
  progress                 UserProgress[]
}

model ContentBankItem {
  id       String          @id @default(uuid())
  process  HexaflexProcess
  category String          // напр. "fused_thought", "avoided_feeling", "self_label"
  text     String
}

model UserProgress {
  id                    String         @id @default(uuid())
  userId                String
  user                  User           @relation(fields: [userId], references: [id])
  exerciseId            String
  exercise              Exercise       @relation(fields: [exerciseId], references: [id])
  status                ProgressStatus @default(NOT_STARTED)
  personalizedContent   Json?          // кешированный результат 4.4
  userResponse          Json?
  completedAt           DateTime?
  checkInDueAt          DateTime?
  checkInCompletedAt    DateTime?

  @@unique([userId, exerciseId])
}

model TokenTransaction {
  id                 String      @id @default(uuid())
  userId             String
  user               User        @relation(fields: [userId], references: [id])
  amount             Int         // + начисление, - списание
  reason             TokenReason
  relatedExerciseId  String?
  relatedBookingId   String?
  createdAt          DateTime    @default(now())
}

model Subscription {
  id                     String              @id @default(uuid())
  userId                 String              @unique
  user                   User                @relation(fields: [userId], references: [id])
  status                 SubscriptionStatus
  trialEndsAt            DateTime
  currentPeriodEnd       DateTime?
  yookassaSubscriptionId String?
}

model Psychologist {
  id                  String             @id @default(uuid())
  userId              String             @unique
  verificationStatus  VerificationStatus @default(PENDING)
  actTrained          Boolean            @default(false)
  bio                 String?
  bookings            Booking[]
}

model Booking {
  id                  String        @id @default(uuid())
  userId              String
  user                User          @relation(fields: [userId], references: [id])
  psychologistId      String
  psychologist        Psychologist  @relation(fields: [psychologistId], references: [id])
  scheduledAt         DateTime
  status              BookingStatus @default(SCHEDULED)
  tokensRedeemed      Int           @default(0)
  cashAmountKopecks   Int           @default(0)
  yookassaPaymentId   String?
}

model Notification {
  id      String    @id @default(uuid())
  userId  String
  user    User      @relation(fields: [userId], references: [id])
  type    String
  payload Json
  sentAt  DateTime?
  readAt  DateTime?
}

model AdminReviewLog {
  id         String   @id @default(uuid())
  entityType String
  entityId   String
  reviewerId String
  action     String
  notes      String?
  createdAt  DateTime @default(now())
}
```

---

## 3. API-контракт (ключевые эндпоинты)

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/auth/register` | Регистрация: имя, возраст, пол, контакт |
| POST | `/auth/otp/request` / `/auth/otp/verify` | Вход по одноразовому коду |
| POST | `/auth/refresh` | Обновление access-токена |
| POST | `/consents` | Фиксация согласия `{type, textVersion}` |
| GET | `/glossary` | Список терминов для тултипов (раздел 5.2 продуктового ТЗ) |
| GET | `/diagnostics/flexibility/questions` | 24 пункта диагностики гибкости |
| POST | `/diagnostics/flexibility/submit` | `{answers: [{itemId, value}]}` → запускает 4.1 |
| GET | `/diagnostics/values/questions` | 17 пунктов ценностного опросника |
| POST | `/diagnostics/values/submit` | `{answers: [{domain, text, importance, consistency}]}` → запускает 4.2 |
| POST | `/diagnostics/context` | `{text}` → **сначала** 4.5 (скрининг), **затем** 4.3 (NLP-профиль) |
| GET | `/profile` | Агрегированный профиль: векторы гибкости, карта ценностей, приоритетные процессы (4.3 продуктового ТЗ) |
| GET | `/branches` | 6 веток с текущим прогрессом и рекомендованным приоритетом |
| GET | `/branches/:process/levels/:level` | Задания уровня, персонализированные через 4.4 |
| POST | `/exercises/:id/submit` | Ответ пользователя → валидация → начисление токенов (4.6) |
| POST | `/exercises/:id/checkin` | Отложенный чек-ин для поведенческих заданий |
| GET | `/tokens/balance` / `/tokens/history` | Баланс и история операций |
| POST | `/subscriptions/start-trial` | Активация 14-дневного пробного периода |
| POST | `/subscriptions/checkout` | Возвращает ссылку/QR ЮKassa |
| POST | `/webhooks/yookassa` | Server-to-server подтверждение оплаты |
| GET | `/psychologists` | Каталог партнёров |
| POST | `/bookings` | `{psychologistId, scheduledAt, tokensToRedeem}` → 4.7 |
| POST | `/bookings/:id/cancel` | Отмена записи |
| GET/POST | `/admin/exercises` | CRUD упражнений (для куратора) |
| GET | `/admin/safety-flags` | Очередь ручного review по `SafetyFlag` |
| POST | `/admin/safety-flags/:id/resolve` | Закрытие флага куратором |

---

## 4. Ключевые алгоритмы

### 4.1 Скоринг диагностики гибкости

На процесс — 4 пункта: 2 «гибких» (прямое кодирование), 2 «застревающих» (реверс). Шкала 1–7.

```
score_process = average(
  flex_item_1,
  flex_item_2,
  8 - inflex_item_1,
  8 - inflex_item_2
)
normalized_0_100 = (score_process - 1) / 6 * 100
composite = average(6 нормализованных значений процессов)
```

Unit-тест обязателен на граничных значениях: все ответы = 1, все = 7, смешанные — см. критерии приёмки (раздел 9).

### 4.2 Карта ценностей

```
gap = importance - consistency   // диапазон -9..9
priority_domains = top 3 домена по убыванию gap (при равенстве — по убыванию importance)
```

### 4.3 Приоритезация процессов для персонализации

```
priority_score[process] = (100 - flexibility_score[process]) + marker_boost[process]

marker_boost:
  fusionMarkers.length > 0      → DEFUSION += 15
  avoidanceMarkers.length > 0   → ACCEPTANCE += 10, COMMITTED_ACTION += 10
  plianceMarkers.length > 0     → VALUES += 15

priority_processes = топ-3 процесса по убыванию priority_score
```

### 4.4 Безопасная персонализация шаблонов

Это критический защитный механизм — реализовать в точности, без упрощений.

```
1. Взять exercise.bodyTemplate (с {{slot}}-плейсхолдерами)
2. Разрешены к заполнению ТОЛЬКО слоты из exercise.allowedSlots
3. Вызов LLM с системным промптом:
   "Заполни ТОЛЬКО перечисленные слоты, используя предоставленный
    контекст пользователя. Не изменяй остальной текст шаблона.
    Не добавляй клинических рекомендаций, не предусмотренных шаблоном."
4. Валидация ответа:
   a) весь текст вне слотов совпадает с оригиналом побайтово —
      если нет, откат к дефолтной (неперсонализированной) версии
   b) содержимое заполненных слотов проходит повторный safety-classifier —
      если небезопасно, откат к дефолту + запись в AdminReviewLog
5. Результат кешируется в UserProgress.personalizedContent
```

LLM не имеет полномочий генерировать текст вне заданных слотов — это архитектурное ограничение, а не рекомендация по промпту.

### 4.5 Скрининг безопасности (обязательный порядок вызовов)

```
POST /diagnostics/context { text }:

  1. riskLevel = вызов LLM-классификатора риска
     (отдельный системный промпт, категории: суицидальные мысли,
      самоповреждение, насилие к себе/другим, острая интоксикация)

  2. если классификатор недоступен (ошибка/таймаут):
       riskLevel = UNKNOWN → обрабатывать как MODERATE
       (fail-safe: по умолчанию безопасный путь, не оптимистичный)

  3. если riskLevel in [MODERATE, HIGH]:
       - создать SafetyFlag
       - текст НЕ передаётся в 4.3 (NLP-профилирование)
       - клиенту возвращается { status: "safety_resources", resources: [...] }
         вместо обычного профиля
       - если HIGH и есть согласие на клиническое кураторство:
           AdminReviewLog.reviewStatus = ESCALATED, приоритетное уведомление куратору

  4. иначе:
       продолжить обычный pipeline → 4.3
```

Список кризисных контактов (раздел 6.4 продуктового ТЗ) хранится в конфиге, не в коде — для обновления без деплоя. Этот эндпоинт и его порядок вызовов покрываются интеграционным тестом, гарантирующим, что 4.3 физически не может выполниться раньше 4.5 (см. критерии приёмки).

### 4.6 Токены за упражнения

```
на POST /exercises/:id/submit:
  progress.status = COMPLETED (или AWAITING_CHECKIN, если exercise.requiresRealLifeCheckIn)
  TokenTransaction(amount = +exercise.tokenReward, reason = EXERCISE_COMPLETED)
  user.tokenBalance += exercise.tokenReward

разблокировка level[n+1] в ветке:
  доступен, если завершено ≥ 80% заданий level[n]
  (порог из открытого вопроса продуктового ТЗ — дефолт для MVP, конфигурируемый параметр)
```

### 4.7 Погашение токенов при бронировании

Формула зависит от выбора продакт-оунера между вариантами А/Б/В (раздел 10 продуктового ТЗ). Пример реализации для варианта А (прогрессивная скидка):

```
discount_percent = min(50, floor(tokensToRedeem / 500))
cash_amount = session_price * (1 - discount_percent / 100)
TokenTransaction(amount = -tokensToRedeem, reason = CONSULTATION_REDEMPTION)
→ инициировать оплату остатка через ЮKassa
```

---

## 5. Инвентарь экранов/роутов (без визуального дизайна — состав и назначение)

| Роут | Назначение | Ключевые данные |
|---|---|---|
| `/register` | Регистрация | User, Consent |
| `/onboarding/1..4` | Приветственный флоу | статично + глоссарий |
| `/diagnostics/flexibility` | 24-пунктовый опросник | DiagnosticResult(FLEXIBILITY) |
| `/diagnostics/values` | 17-пунктовый опросник | DiagnosticResult(VALUES) |
| `/diagnostics/context` | Свободный текст ситуации | ContextProfile, SafetyFlag |
| `/safety-resources` | Кризисные ресурсы — **всегда доступен**, не только по триггеру | конфиг контактов |
| `/profile` | Дэшборд: радар 6 процессов, карта ценностей (Bull's Eye) | FlexibilityScore, ValuesEntry[] |
| `/branches` | 6 веток с прогрессом | UserProgress[] |
| `/branches/:process/level/:n` | Раннер заданий уровня | Exercise, персонализированный контент |
| `/tokens` | Баланс и история | TokenTransaction[] |
| `/subscription` | Статус подписки, оплата | Subscription |
| `/psychologists` | Каталог партнёров | Psychologist[] |
| `/psychologists/:id/book` | Бронирование | Booking |
| `/admin/*` | CMS куратора: упражнения, safety-flags, контент-банки | — |

---

## 6. Нефункциональные требования

- **Шифрование:** `DiagnosticResult.rawAnswers`, `ValuesEntry.textAnswer`, `ContextProfile.rawText` — шифровать на уровне приложения (AES-256) до записи в БД, не полагаться только на шифрование диска.
- **Логи:** структурированные, без сырого содержимого чувствительных полей в открытом виде — маскировать перед записью в лог-агрегатор.
- **RBAC:** middleware на уровне NestJS guard, проверка `Role` на каждый admin/куратор эндпоинт.
- **Rate limiting:** обязателен на `/auth/*` и `/diagnostics/context` (защита от злоупотребления дорогим LLM-вызовом).
- **Производительность:** p95 < 300 мс для обычных CRUD-эндпоинтов; для персонализации (4.4) — до 3 с приемлемо при явном loading-состоянии на фронте, результат кешируется и не пересчитывается повторно.
- **Локализация данных:** первичное хранение — на серверах в РФ (см. раздел 1).
- **Доступность:** WCAG AA как минимум для веб-версии — аудитория может находиться в состоянии тревоги/стресса, доступность здесь не второстепенна.
- **Тестирование:** unit-тесты на 100% формул раздела 4.1–4.3 (это критическая бизнес-логика); интеграционный тест, жёстко фиксирующий порядок вызовов 4.5 → 4.3 (безопасность не может деградировать при рефакторинге); e2e на основной путь регистрация → диагностика → первое упражнение → токен.

---

## 7. Структура репозитория

```
/apps
  /web                     Next.js (PWA)
  /api                     NestJS
    /src
      /auth
      /diagnostics         (4.1, 4.2 — скоринг)
      /context-safety      (4.3, 4.5 — NLP-профиль + скрининг, разделены модульно)
      /profile             (4.3 профиля — приоритезация)
      /exercises           (движок 13 форматов + 4.4 персонализация)
      /tokens               (4.6, 4.7)
      /subscriptions        (ЮKassa)
      /psychologists
      /admin
      /common              (guards, encryption utils, LLM-client wrapper)
/packages
  /shared-types            общие TS-типы web/api
  /content                 JSON-банки контента, экспорт из продуктового ТЗ
/prisma
  schema.prisma
  /migrations
/docs
  Spektr_TZ_funkcional_i_arhitektura_v1.md   (источник бизнес-правил и контента)
  Spektr_TZ_dlya_razrabotki_AI_v1.md         (этот файл)
```

Важно: модуль `context-safety` физически отделён от `profile`, чтобы порядок вызовов из 4.5 нельзя было случайно нарушить при рефакторинге другого модуля.

---

## 8. План реализации (эпики)

1. **Инфраструктура** — репозиторий, CI/CD, схема БД, каркас auth, хостинг на РФ-облаке.
2. **Регистрация, онбординг, глоссарий.**
3. **Диагностика гибкости** (24 пункта) + скоринг 4.1.
4. **Диагностика ценностей** (17 пунктов) + скоринг 4.2.
5. **Контекстный сбор + скрининг безопасности** — приоритетный критический путь, реализовать и покрыть тестами до начала работы с персонализацией.
6. **Профиль и приоритезация** (4.3).
7. **Движок 13 форматов заданий** + первая полностью готовая ветка «Разделение» (контент есть в продуктовом ТЗ).
8. **Токены** — начисление/списание/баланс.
9. **Подписка + ЮKassa.**
10. **Вторая MVP-ветка** («Ценности» — контент уже подготовлен).
11. **Модуль психологов-партнёров** + бронирование.
12. **Админка/CMS** для куратора.
13. **Дэшборд аналитики** (радар, карта ценностей).
14. **Остальные 4 ветки** — по мере готовности контент-банков.

---

## 9. Критерии приёмки (примеры для критических модулей)

**Эпик 5 (скрининг безопасности):**
- Ни один текст из `/diagnostics/context` не достигает 4.3 без предварительного прохождения 4.5 — подтверждено тестом, фиксирующим порядок вызовов через мок с проверкой последовательности.
- При `riskLevel ∈ {MODERATE, HIGH, UNKNOWN}` пользователь всегда получает экран ресурсов независимо от прочих сбоев системы.
- Список кризисных контактов читается из конфига, не захардкожен.

**Эпик 3–4 (диагностика):**
- Формулы 4.1–4.2 покрыты unit-тестами на граничных значениях.
- Reverse-coding (`8 - value`) математически проверен отдельным тестом.

**Эпик 7 (движок форматов):**
- Каждый из 13 форматов — переиспользуемый компонент, принимающий контент через единый интерфейс; добавление нового пункта в контент-банк не требует деплоя кода.

**Эпик 4.4 (персонализация):**
- Тест, подтверждающий откат к дефолтному тексту при попытке LLM изменить текст вне `allowedSlots`.

---

Документ фиксирует архитектурные решения на дату подготовки. Открытые продуктовые развилки (токеномика, возрастная политика, юридический статус партнёров-психологов) — см. раздел 16 продуктового ТЗ; реализация 4.7 и возрастной логики User.isMinor должна быть параметризована, а не захардкожена, чтобы не блокировать разработку до финального решения.
