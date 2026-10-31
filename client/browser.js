export function createMemoryBrowserClient(require, styles) {
	const React = require("react");
	const {
		Button, Input, Menu, MenuItemButton, Switch, Tooltip,
		IconPlusOutlineRegular, IconSearchOutlineRegular, IconCloseOutlineRegular,
		IconChevronDownOutlineRegular, IconCheckOutlineRegular,
	} = require("@deepseek-ai/dsh-client-ui-primitives");
	const h = React.createElement;
	const locale = "layered-memory";
	const dictionaries = {
		zh: {
			ruleContentCount: "当前 {count} / {limit} 字符", ruleContentNearLimit: "接近规则正文上限，请保留完整适用条件。", ruleContentOverLimit: "规则正文超过 {limit} 字符，请精简后保存。",
			title: "记忆", newEntry: "新建条目", namespace: "命名空间", search: "搜索记忆", searchPlaceholder: "搜索标题或正文", clearSearch: "清空搜索",
			all: "全部", showArchived: "显示已归档", entries: "记忆条目", loading: "正在读取…", empty: "没有匹配的记忆条目", emptyDetail: "从左侧选择一条记忆",
			archived: "已归档", content: "内容", evidence: "证据", save: "保存", saving: "保存中…", archive: "归档", restore: "恢复",
			history: "历史快照", noHistory: "暂无历史快照", rollback: "回滚到此版本", rollbackConfirm: "确认回滚", cancel: "取消",
			rollbackWarning: "回滚会覆盖当前内容，是否继续？", requiredFields: "命名空间、标题、内容、证据都必须填写", loadTimeout: "记忆数据加载超时", saved: "已保存", archivedDone: "归档状态已更新", rolledBack: "已回滚到所选快照", preview: "预览", collapse: "收起", initialVersion: "初始版本", evidenceUpdated: "证据更新", contentDelta: "内容 {delta} 字符", noContentChange: "无正文变化", noSummary: "（空内容）", noPreview: "该快照没有可预览的正文", editMode: "编辑", previewMode: "预览",
			reload: "重新加载", conflict: "条目已被其他会话修改，请重新加载后再保存。", createTitle: "新建记忆条目", topic: "标题",
			topicPlaceholder: "输入条目标题", contentPlaceholder: "输入记忆正文", evidencePlaceholder: "输入本次写入的证据", create: "创建", creating: "创建中…",
			created: "条目已创建", close: "关闭", createdAt: "创建时间", updatedAt: "更新时间", characters: "{count} 字符",
			listFailed: "条目列表读取失败", detailFailed: "条目详情读取失败", historyFailed: "历史快照读取失败", noNamespace: "暂无可用命名空间",
			"usage.used": "索引已用", "usage.total": "{used} / {budget} 字符", "usage.over": "已超注入预算，较早条目不会进入提示词",
			"usage.count": "{count} 条", "usage.share": "占已用 {share}%",
			"usage.label.head": "说明", "usage.label.rules": "规则", "usage.label.facts": "事实目录", "usage.label.sops": "经验目录",
			"kind.rule": "规则", "kind.fact": "事实", "kind.sop": "经验", kindLabel: "类型", ruleEvidencePlaceholder: "输入规则依据，例如用户的明确指令",
			"usage.tip.head": "索引头部说明", "usage.tip.rules": "L0 红线规则", "usage.tip.facts": "事实条目目录（facts.md）", "usage.tip.sops": "任务经验目录（sops/）",
		},
		en: {
			ruleContentCount: "Current {count} / {limit} characters", ruleContentNearLimit: "Approaching the rule limit; keep all applicability conditions.", ruleContentOverLimit: "The rule exceeds {limit} characters. Shorten it before saving.",
			title: "Memory", newEntry: "New entry", namespace: "Namespace", search: "Search memory", searchPlaceholder: "Search titles or content", clearSearch: "Clear search",
			all: "All", showArchived: "Show archived", entries: "Memory entries", loading: "Loading…", empty: "No matching memory entries", emptyDetail: "Select a memory entry on the left",
			archived: "Archived", content: "Content", evidence: "Evidence", save: "Save", saving: "Saving…", archive: "Archive", restore: "Restore",
			history: "History", noHistory: "No history snapshots", rollback: "Roll back to this version", rollbackConfirm: "Confirm rollback", cancel: "Cancel",
			rollbackWarning: "Rolling back replaces the current content. Continue?", requiredFields: "Namespace, title, content, and evidence are required", loadTimeout: "Timed out loading memory data", saved: "Saved", archivedDone: "Archive state updated", rolledBack: "Rolled back to the selected snapshot", preview: "Preview", collapse: "Collapse", initialVersion: "Initial version", evidenceUpdated: "Evidence updated", contentDelta: "Content {delta} chars", noContentChange: "No content change", noSummary: "(empty)", noPreview: "This snapshot has no preview", editMode: "Edit", previewMode: "Preview",
			reload: "Reload", conflict: "This entry changed elsewhere. Reload it before saving again.", createTitle: "New memory entry", topic: "Title",
			topicPlaceholder: "Enter an entry title", contentPlaceholder: "Enter memory content", evidencePlaceholder: "Enter evidence for this write", create: "Create", creating: "Creating…",
			created: "Entry created", close: "Close", createdAt: "Created", updatedAt: "Updated", characters: "{count} characters",
			listFailed: "Could not load entries", detailFailed: "Could not load entry details", historyFailed: "Could not load history", noNamespace: "No namespaces available",
			"usage.used": "Index used", "usage.total": "{used} / {budget} chars", "usage.over": "Over the injection budget; older entries stay out of the prompt",
			"usage.count": "{count} entries", "usage.share": "{share}% of used",
			"usage.label.head": "Header", "usage.label.rules": "Rules", "usage.label.facts": "Facts", "usage.label.sops": "Skills",
			"kind.rule": "Rule", "kind.fact": "Fact", "kind.sop": "Skill", kindLabel: "Type", ruleEvidencePlaceholder: "Enter the basis for this rule, such as an explicit user instruction",
			"usage.tip.head": "Index header", "usage.tip.rules": "L0 red-line rules", "usage.tip.facts": "Fact entries (facts.md)", "usage.tip.sops": "Skill entries (sops/)",
		},
		ja: {
			ruleContentCount: "現在 {count} / {limit} 文字", ruleContentNearLimit: "ルール本文の上限に近づいています。適用条件をすべて保持してください。", ruleContentOverLimit: "ルール本文が {limit} 文字を超えています。短くして保存してください。",
			"title": "メモリ", "newEntry": "新規エントリ", "namespace": "名前空間", "search": "メモリを検索", "searchPlaceholder": "タイトルまたは本文を検索", "clearSearch": "検索をクリア",
			"all": "すべて", "showArchived": "アーカイブを表示", "entries": "メモリエントリ", "loading": "読み込み中…", "empty": "一致するエントリがありません", "emptyDetail": "左からエントリを選択",
			"archived": "アーカイブ済み", "content": "内容", "evidence": "根拠", "save": "保存", "saving": "保存中…", "archive": "アーカイブ", "restore": "復元",
			"history": "履歴", "noHistory": "履歴スナップショットなし", "rollback": "このバージョンに戻す", "rollbackConfirm": "ロールバックを確認", "cancel": "キャンセル",
			"rollbackWarning": "ロールバックすると現在の内容が上書きされます。続行しますか？", "requiredFields": "名前空間・タイトル・内容・根拠は必須です", "loadTimeout": "メモリデータの読み込みがタイムアウトしました", "saved": "保存しました", "archivedDone": "アーカイブ状態を更新しました", "rolledBack": "選択したスナップショットに戻しました", "preview": "プレビュー", "collapse": "折りたたむ", "initialVersion": "初期バージョン", "evidenceUpdated": "根拠を更新", "contentDelta": "内容 {delta} 文字", "noContentChange": "本文の変更なし", "noSummary": "（空の内容）", "noPreview": "このスナップショットにはプレビューできる本文がありません", "editMode": "編集", "previewMode": "プレビュー",
			"reload": "再読み込み", "conflict": "他のセッションで変更されました。再読み込みしてから保存してください。", "createTitle": "新しいメモリエントリ", "topic": "タイトル",
			"topicPlaceholder": "タイトルを入力", "contentPlaceholder": "メモリ本文を入力", "evidencePlaceholder": "今回の書き込みの根拠を入力", "create": "作成", "creating": "作成中…",
			"created": "エントリを作成しました", "close": "閉じる", "createdAt": "作成日時", "updatedAt": "更新日時", "characters": "{count} 文字",
			"listFailed": "エントリ一覧の読み込みに失敗しました", "detailFailed": "エントリ詳細の読み込みに失敗しました", "historyFailed": "履歴の読み込みに失敗しました", "noNamespace": "利用可能な名前空間がありません",
			"usage.used": "インデックス使用量", "usage.total": "{used} / {budget} 文字", "usage.over": "注入予算を超過しています。古い項目はプロンプトに含まれません",
			"usage.count": "{count} 件", "usage.share": "使用量の {share}%",
			"usage.label.head": "ヘッダー", "usage.label.rules": "ルール", "usage.label.facts": "ファクト", "usage.label.sops": "スキル",
			"kind.rule": "ルール", "kind.fact": "ファクト", "kind.sop": "スキル", kindLabel: "種類", ruleEvidencePlaceholder: "ユーザーの明示的な指示など、ルールの根拠を入力",
			"usage.tip.head": "インデックスのヘッダー", "usage.tip.rules": "L0 の必須ルール", "usage.tip.facts": "ファクト項目のディレクトリ（facts.md）", "usage.tip.sops": "タスク経験のディレクトリ（sops/）",
		},
		es: {
			ruleContentCount: "Actual: {count} / {limit} caracteres", ruleContentNearLimit: "Cerca del límite de la regla; conserva todas las condiciones de aplicación.", ruleContentOverLimit: "La regla supera los {limit} caracteres. Acórtala antes de guardar.",
			"title": "Memoria", "newEntry": "Nueva entrada", "namespace": "Espacio de nombres", "search": "Buscar en la memoria", "searchPlaceholder": "Buscar títulos o contenido", "clearSearch": "Limpiar búsqueda",
			"all": "Todo", "showArchived": "Mostrar archivados", "entries": "Entradas de memoria", "loading": "Cargando…", "empty": "No hay entradas coincidentes", "emptyDetail": "Selecciona una entrada a la izquierda",
			"archived": "Archivado", "content": "Contenido", "evidence": "Evidencia", "save": "Guardar", "saving": "Guardando…", "archive": "Archivar", "restore": "Restaurar",
			"history": "Historial", "noHistory": "Sin instantáneas de historial", "rollback": "Revertir a esta versión", "rollbackConfirm": "Confirmar reversión", "cancel": "Cancelar",
			"rollbackWarning": "Revertir reemplaza el contenido actual. ¿Continuar?", "requiredFields": "Espacio de nombres, título, contenido y evidencia son obligatorios", "loadTimeout": "Se agotó el tiempo de carga de datos", "saved": "Guardado", "archivedDone": "Estado de archivo actualizado", "rolledBack": "Revertido al instantáneo seleccionado", "preview": "Vista previa", "collapse": "Contraer", "initialVersion": "Versión inicial", "evidenceUpdated": "Evidencia actualizada", "contentDelta": "Contenido {delta} caracteres", "noContentChange": "Sin cambios en el cuerpo", "noSummary": "(vacío)", "noPreview": "Este instantáneo no tiene cuerpo previsualizable", "editMode": "Editar", "previewMode": "Vista previa",
			"reload": "Recargar", "conflict": "Esta entrada cambió en otra sesión. Recárgala antes de guardar.", "createTitle": "Nueva entrada de memoria", "topic": "Título",
			"topicPlaceholder": "Introduce un título", "contentPlaceholder": "Introduce el contenido", "evidencePlaceholder": "Introduce la evidencia de esta escritura", "create": "Crear", "creating": "Creando…",
			"created": "Entrada creada", "close": "Cerrar", "createdAt": "Creado", "updatedAt": "Actualizado", "characters": "{count} caracteres",
			"listFailed": "No se pudo cargar la lista de entradas", "detailFailed": "No se pudieron cargar los detalles", "historyFailed": "No se pudo cargar el historial", "noNamespace": "No hay espacios de nombres disponibles",
			"usage.used": "Índice usado", "usage.total": "{used} / {budget} caracteres", "usage.over": "Se superó el presupuesto de inyección; las entradas antiguas no se incluyen en el prompt",
			"usage.count": "{count} entradas", "usage.share": "{share}% de lo usado",
			"usage.label.head": "Encabezado", "usage.label.rules": "Reglas", "usage.label.facts": "Hechos", "usage.label.sops": "Habilidades",
			"kind.rule": "Regla", "kind.fact": "Hecho", "kind.sop": "Habilidad", kindLabel: "Tipo", ruleEvidencePlaceholder: "Introduce la base de la regla, como una instrucción explícita del usuario",
			"usage.tip.head": "Encabezado del índice", "usage.tip.rules": "Reglas esenciales L0", "usage.tip.facts": "Directorio de hechos (facts.md)", "usage.tip.sops": "Directorio de experiencias (sops/)",
		},
		fr: {
			ruleContentCount: "Actuellement {count} / {limit} caractères", ruleContentNearLimit: "La limite approche ; conservez toutes les conditions d’application de la règle.", ruleContentOverLimit: "La règle dépasse {limit} caractères. Raccourcissez-la avant d’enregistrer.",
			"title": "Mémoire", "newEntry": "Nouvelle entrée", "namespace": "Espace de noms", "search": "Rechercher dans la mémoire", "searchPlaceholder": "Rechercher titres ou contenu", "clearSearch": "Effacer la recherche",
			"all": "Tout", "showArchived": "Afficher les archivés", "entries": "Entrées mémoire", "loading": "Chargement…", "empty": "Aucune entrée correspondante", "emptyDetail": "Sélectionnez une entrée à gauche",
			"archived": "Archivé", "content": "Contenu", "evidence": "Preuve", "save": "Enregistrer", "saving": "Enregistrement…", "archive": "Archiver", "restore": "Restaurer",
			"history": "Historique", "noHistory": "Aucun instantané d’historique", "rollback": "Revenir à cette version", "rollbackConfirm": "Confirmer le retour", "cancel": "Annuler",
			"rollbackWarning": "Le retour remplace le contenu actuel. Continuer ?", "requiredFields": "L’espace de noms, le titre, le contenu et la preuve sont obligatoires", "loadTimeout": "Le chargement des données a expiré", "saved": "Enregistré", "archivedDone": "État d’archivage mis à jour", "rolledBack": "Revenu à l’instantané sélectionné", "preview": "Aperçu", "collapse": "Réduire", "initialVersion": "Version initiale", "evidenceUpdated": "Preuve mise à jour", "contentDelta": "Contenu {delta} caractères", "noContentChange": "Aucun changement de contenu", "noSummary": "(vide)", "noPreview": "Cet instantané n’a pas de contenu à prévisualiser", "editMode": "Modifier", "previewMode": "Aperçu",
			"reload": "Recharger", "conflict": "Cette entrée a changé ailleurs. Rechargez-la avant d’enregistrer.", "createTitle": "Nouvelle entrée mémoire", "topic": "Titre",
			"topicPlaceholder": "Saisir un titre", "contentPlaceholder": "Saisir le contenu de la mémoire", "evidencePlaceholder": "Saisir la preuve de cette écriture", "create": "Créer", "creating": "Création…",
			"created": "Entrée créée", "close": "Fermer", "createdAt": "Créé", "updatedAt": "Mis à jour", "characters": "{count} caractères",
			"listFailed": "Échec du chargement de la liste", "detailFailed": "Échec du chargement des détails", "historyFailed": "Échec du chargement de l’historique", "noNamespace": "Aucun espace de noms disponible",
			"usage.used": "Indice utilisé", "usage.total": "{used} / {budget} caractères", "usage.over": "Budget d’injection dépassé ; les entrées anciennes ne sont pas incluses dans le prompt",
			"usage.count": "{count} entrées", "usage.share": "{share}% de l’utilisé",
			"usage.label.head": "En-tête", "usage.label.rules": "Règles", "usage.label.facts": "Faits", "usage.label.sops": "Compétences",
			"kind.rule": "Règle", "kind.fact": "Fait", "kind.sop": "Compétence", kindLabel: "Type", ruleEvidencePlaceholder: "Saisir le fondement de la règle, par exemple une instruction explicite de l’utilisateur",
			"usage.tip.head": "En-tête de l’index", "usage.tip.rules": "Règles essentielles L0", "usage.tip.facts": "Répertoire des faits (facts.md)", "usage.tip.sops": "Répertoire des expériences (sops/)",
		},
		de: {
			ruleContentCount: "Aktuell {count} / {limit} Zeichen", ruleContentNearLimit: "Die Regel nähert sich dem Limit. Alle Geltungsbedingungen beibehalten.", ruleContentOverLimit: "Die Regel überschreitet {limit} Zeichen. Vor dem Speichern kürzen.",
			"title": "Speicher", "newEntry": "Neuer Eintrag", "namespace": "Namespace", "search": "Speicher durchsuchen", "searchPlaceholder": "Titel oder Inhalt durchsuchen", "clearSearch": "Suche löschen",
			"all": "Alle", "showArchived": "Archivierte anzeigen", "entries": "Speichereinträge", "loading": "Wird geladen…", "empty": "Keine passenden Einträge", "emptyDetail": "Eintrag links auswählen",
			"archived": "Archiviert", "content": "Inhalt", "evidence": "Nachweis", "save": "Speichern", "saving": "Speichern…", "archive": "Archivieren", "restore": "Wiederherstellen",
			"history": "Verlauf", "noHistory": "Keine Verlaufs-Snapshots", "rollback": "Zu dieser Version zurücksetzen", "rollbackConfirm": "Rollback bestätigen", "cancel": "Abbrechen",
			"rollbackWarning": "Ein Rollback ersetzt den aktuellen Inhalt. Fortfahren?", "requiredFields": "Namespace, Titel, Inhalt und Nachweis sind erforderlich", "loadTimeout": "Zeitüberschreitung beim Laden der Speicherdaten", "saved": "Gespeichert", "archivedDone": "Archivstatus aktualisiert", "rolledBack": "Zum ausgewählten Snapshot zurückgesetzt", "preview": "Vorschau", "collapse": "Einklappen", "initialVersion": "Erstversion", "evidenceUpdated": "Nachweis aktualisiert", "contentDelta": "Inhalt {delta} Zeichen", "noContentChange": "Keine Inhaltsänderung", "noSummary": "(leer)", "noPreview": "Dieser Snapshot hat keinen anzeigbaren Inhalt", "editMode": "Bearbeiten", "previewMode": "Vorschau",
			"reload": "Neu laden", "conflict": "Dieser Eintrag wurde anderswo geändert. Vor dem Speichern neu laden.", "createTitle": "Neuer Speichereintrag", "topic": "Titel",
			"topicPlaceholder": "Titel eingeben", "contentPlaceholder": "Speicherinhalt eingeben", "evidencePlaceholder": "Nachweis für diesen Schreibvorgang eingeben", "create": "Erstellen", "creating": "Erstellen…",
			"created": "Eintrag erstellt", "close": "Schließen", "createdAt": "Erstellt", "updatedAt": "Aktualisiert", "characters": "{count} Zeichen",
			"listFailed": "Eintragsliste konnte nicht geladen werden", "detailFailed": "Eintragsdetails konnten nicht geladen werden", "historyFailed": "Verlauf konnte nicht geladen werden", "noNamespace": "Keine Namespaces verfügbar",
			"usage.used": "Index belegt", "usage.total": "{used} / {budget} Zeichen", "usage.over": "Injektionsbudget überschritten; ältere Einträge gelangen nicht in den Prompt",
			"usage.count": "{count} Einträge", "usage.share": "{share}% der Belegung",
			"usage.label.head": "Kopfzeile", "usage.label.rules": "Regeln", "usage.label.facts": "Fakten", "usage.label.sops": "Fähigkeiten",
			"kind.rule": "Regel", "kind.fact": "Fakt", "kind.sop": "Fähigkeit", kindLabel: "Typ", ruleEvidencePlaceholder: "Grundlage der Regel eingeben, etwa eine ausdrückliche Nutzeranweisung",
			"usage.tip.head": "Index-Kopfzeile", "usage.tip.rules": "L0-Grundregeln", "usage.tip.facts": "Verzeichnis der Fakten (facts.md)", "usage.tip.sops": "Verzeichnis der Erfahrungen (sops/)",
		},
		ru: {
			ruleContentCount: "Сейчас {count} / {limit} символов", ruleContentNearLimit: "Правило близко к лимиту. Сохраните все условия применения.", ruleContentOverLimit: "Правило превышает {limit} символов. Сократите его перед сохранением.",
			"title": "Память", "newEntry": "Новая запись", "namespace": "Пространство имён", "search": "Поиск в памяти", "searchPlaceholder": "Поиск по заголовкам или тексту", "clearSearch": "Очистить поиск",
			"all": "Все", "showArchived": "Показать архивные", "entries": "Записи памяти", "loading": "Загрузка…", "empty": "Нет подходящих записей", "emptyDetail": "Выберите запись слева",
			"archived": "В архиве", "content": "Содержимое", "evidence": "Доказательство", "save": "Сохранить", "saving": "Сохранение…", "archive": "В архив", "restore": "Восстановить",
			"history": "История", "noHistory": "Нет снимков истории", "rollback": "Откатить к этой версии", "rollbackConfirm": "Подтвердить откат", "cancel": "Отмена",
			"rollbackWarning": "Откат заменит текущее содержимое. Продолжить?", "requiredFields": "Пространство имён, заголовок, содержимое и доказательство обязательны", "loadTimeout": "Время ожидания данных истекло", "saved": "Сохранено", "archivedDone": "Статус архива обновлён", "rolledBack": "Выполнен откат к выбранному снимку", "preview": "Предпросмотр", "collapse": "Свернуть", "initialVersion": "Начальная версия", "evidenceUpdated": "Доказательство обновлено", "contentDelta": "Содержимое {delta} символов", "noContentChange": "Без изменений содержимого", "noSummary": "(пусто)", "noPreview": "У этого снимка нет содержимого для предпросмотра", "editMode": "Изменить", "previewMode": "Предпросмотр",
			"reload": "Перезагрузить", "conflict": "Запись изменена в другом сеансе. Перезагрузите перед сохранением.", "createTitle": "Новая запись памяти", "topic": "Заголовок",
			"topicPlaceholder": "Введите заголовок", "contentPlaceholder": "Введите содержимое памяти", "evidencePlaceholder": "Введите доказательство этой записи", "create": "Создать", "creating": "Создание…",
			"created": "Запись создана", "close": "Закрыть", "createdAt": "Создано", "updatedAt": "Обновлено", "characters": "{count} символов",
			"listFailed": "Не удалось загрузить список записей", "detailFailed": "Не удалось загрузить детали записи", "historyFailed": "Не удалось загрузить историю", "noNamespace": "Нет доступных пространств имён",
			"usage.used": "Индекс занят", "usage.total": "{used} / {budget} символов", "usage.over": "Превышен бюджет внедрения; старые записи не попадут в промпт",
			"usage.count": "{count} записей", "usage.share": "{share}% от занятого",
			"usage.label.head": "Заголовок", "usage.label.rules": "Правила", "usage.label.facts": "Факты", "usage.label.sops": "Навыки",
			"kind.rule": "Правило", "kind.fact": "Факт", "kind.sop": "Навык", kindLabel: "Тип", ruleEvidencePlaceholder: "Укажите основание правила, например явное указание пользователя",
			"usage.tip.head": "Заголовок индекса", "usage.tip.rules": "Базовые правила L0", "usage.tip.facts": "Каталог фактов (facts.md)", "usage.tip.sops": "Каталог опыта (sops/)",
		},
		pt: {
			ruleContentCount: "Atual: {count} / {limit} caracteres", ruleContentNearLimit: "Perto do limite da regra; preserve todas as condições de aplicação.", ruleContentOverLimit: "A regra excede {limit} caracteres. Encurte-a antes de salvar.",
			"title": "Memória", "newEntry": "Nova entrada", "namespace": "Namespace", "search": "Pesquisar memória", "searchPlaceholder": "Pesquisar títulos ou conteúdo", "clearSearch": "Limpar pesquisa",
			"all": "Tudo", "showArchived": "Mostrar arquivados", "entries": "Entradas de memória", "loading": "Carregando…", "empty": "Nenhuma entrada correspondente", "emptyDetail": "Selecione uma entrada à esquerda",
			"archived": "Arquivado", "content": "Conteúdo", "evidence": "Evidência", "save": "Salvar", "saving": "Salvando…", "archive": "Arquivar", "restore": "Restaurar",
			"history": "Histórico", "noHistory": "Sem instantâneos de histórico", "rollback": "Reverter para esta versão", "rollbackConfirm": "Confirmar reversão", "cancel": "Cancelar",
			"rollbackWarning": "Reverter substitui o conteúdo atual. Continuar?", "requiredFields": "Namespace, título, conteúdo e evidência são obrigatórios", "loadTimeout": "O carregamento dos dados expirou", "saved": "Salvo", "archivedDone": "Estado de arquivamento atualizado", "rolledBack": "Revertido para o instantâneo selecionado", "preview": "Pré-visualizar", "collapse": "Recolher", "initialVersion": "Versão inicial", "evidenceUpdated": "Evidência atualizada", "contentDelta": "Conteúdo {delta} caracteres", "noContentChange": "Sem alteração de conteúdo", "noSummary": "(vazio)", "noPreview": "Este instantâneo não tem conteúdo pré-visualizável", "editMode": "Editar", "previewMode": "Pré-visualizar",
			"reload": "Recarregar", "conflict": "Esta entrada mudou em outra sessão. Recarregue antes de salvar.", "createTitle": "Nova entrada de memória", "topic": "Título",
			"topicPlaceholder": "Insira um título", "contentPlaceholder": "Insira o conteúdo da memória", "evidencePlaceholder": "Insira a evidência desta gravação", "create": "Criar", "creating": "Criando…",
			"created": "Entrada criada", "close": "Fechar", "createdAt": "Criado", "updatedAt": "Atualizado", "characters": "{count} caracteres",
			"listFailed": "Falha ao carregar a lista de entradas", "detailFailed": "Falha ao carregar os detalhes", "historyFailed": "Falha ao carregar o histórico", "noNamespace": "Nenhum namespace disponível",
			"usage.used": "Índice usado", "usage.total": "{used} / {budget} caracteres", "usage.over": "Orçamento de injeção excedido; entradas antigas ficam fora do prompt",
			"usage.count": "{count} entradas", "usage.share": "{share}% do usado",
			"usage.label.head": "Cabeçalho", "usage.label.rules": "Regras", "usage.label.facts": "Fatos", "usage.label.sops": "Habilidades",
			"kind.rule": "Regra", "kind.fact": "Fato", "kind.sop": "Habilidade", kindLabel: "Tipo", ruleEvidencePlaceholder: "Insira a base da regra, como uma instrução explícita do usuário",
			"usage.tip.head": "Cabeçalho do índice", "usage.tip.rules": "Regras essenciais L0", "usage.tip.facts": "Diretório de fatos (facts.md)", "usage.tip.sops": "Diretório de experiências (sops/)",
		},
	};
	async function resultValue(request) {
		const result = await request;
		if (!result.ok) throw new Error(result.error.message);
		return result.value;
	}
	const identity = entry => JSON.stringify([entry.namespace, entry.kind, entry.key]);
	const time = value => {
		if (!value) return "—";
		const lang = (typeof document !== "undefined" && document.documentElement.lang) || "zh-CN";
		return new Date(value).toLocaleString(lang, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" });
	};
	const ruleContentLimit = 100;
	const ruleContentLength = content => Array.from(content.trim()).length;
	const ruleContentOverLimit = (kind, content) => kind === "rule" && ruleContentLength(content) > ruleContentLimit;
	const entryKinds = ["rule", "fact", "sop"];
	const kindText = (kind, t) => (entryKinds.includes(kind) ? t("kind." + kind) : kind);
	function compactChars(value) {
		const number = Number(value);
		if (!Number.isFinite(number) || number <= 0) return "0";
		if (number < 1000) return String(Math.round(number));
		const scaled = number / 1000;
		return (scaled >= 100 ? String(Math.round(scaled)) : scaled.toFixed(1)) + "K";
	}
	function renderInline(text, keyPrefix) {
		const parts = [];
		let rest = text;
		let idx = 0;
		const patterns = [
			[/\*\*([^*]+)\*\*/, (m, t) => h("strong", { key: keyPrefix + idx++ }, t)],
			[/\*([^*]+)\*/, (m, t) => h("em", { key: keyPrefix + idx++ }, t)],
			[/`([^`]+)`/, (m, t) => h("code", { key: keyPrefix + idx++ }, t)],
			[/\[([^\]]+)\]\(([^)]+)\)/, (m, t, u) => h("a", { key: keyPrefix + idx++, href: u, target: "_blank", rel: "noopener" }, t)],
		];
		while (rest.length > 0) {
			let earliest = null, earliestRe = null, earliestFn = null;
			for (const [re, fn] of patterns) {
				const m = rest.match(re);
				if (m && (earliest === null || m.index < earliest)) {
					earliest = m.index; earliestRe = m; earliestFn = fn;
				}
			}
			if (earliest === null) { parts.push(rest); break; }
			if (earliest > 0) parts.push(rest.slice(0, earliest));
			parts.push(earliestFn(...earliestRe));
			rest = rest.slice(earliest + earliestRe[0].length);
		}
		return parts;
	}
	function renderMarkdown(text) {
		const lines = String(text || "").split(/\r?\n/);
		const blocks = [];
		let listItems = null, listOrdered = false;
		let paraLines = [];
		const flushPara = () => {
			if (paraLines.length) {
				blocks.push(h("p", { key: "p" + blocks.length }, renderInline(paraLines.join("\n"), "pi")));
				paraLines = [];
			}
		};
		const flushList = () => {
			if (listItems && listItems.length) {
				const tag = listOrdered ? "ol" : "ul";
				blocks.push(h(tag, { key: "l" + blocks.length }, listItems.map((item, i) => h("li", { key: "li" + i }, renderInline(item, "li" + i)))));
			}
			listItems = null;
		};
		for (const line of lines) {
			const hMatch = line.match(/^(#{1,6})\s+(.*)/);
			const ulMatch = line.match(/^[-*+]\s+(.*)/);
			const olMatch = line.match(/^\d+[.)]\s+(.*)/);
			const quoteMatch = line.match(/^>\s?(.*)/);
			if (hMatch) {
				flushPara(); flushList();
				const level = hMatch[1].length;
				blocks.push(h("h" + Math.min(level + 1, 6), { key: "h" + blocks.length }, renderInline(hMatch[2], "hi")));
			} else if (ulMatch || olMatch) {
				flushPara();
				const isOl = !!olMatch;
				if (listItems && listOrdered !== isOl) flushList();
				if (!listItems) { listItems = []; listOrdered = isOl; }
				listItems.push((ulMatch || olMatch)[1]);
			} else if (quoteMatch) {
				flushPara(); flushList();
				blocks.push(h("blockquote", { key: "q" + blocks.length }, renderInline(quoteMatch[1], "qi")));
			} else if (/^---+$/.test(line.trim())) {
				flushPara(); flushList();
				blocks.push(h("hr", { key: "hr" + blocks.length }));
			} else if (line.trim() === "") {
				flushPara(); flushList();
			} else {
				flushList();
				paraLines.push(line);
			}
		}
		flushPara(); flushList();
		return blocks;
	}
	function MemoryBrowserIcon({ size = 20 }) {
		return h("svg", { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true },
			h("path", { d: "M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" }),
			h("path", { d: "M5 4.5v17M8.5 6H16M8.5 10H16M8.5 14H13" }));
	}
	function RuleContentHint({ kind, content, id, t }) {
		if (kind !== "rule") return null;
		const count = ruleContentLength(content);
		const over = count > ruleContentLimit;
		const near = count >= ruleContentLimit * 0.9;
		return h("span", { id, className: "lm-browser-rule-length" + (over ? " is-over" : near ? " is-near" : ""), role: over ? "alert" : "status", "aria-live": "polite", "aria-atomic": true },
			h("span", { className: "lm-browser-rule-count" }, t("ruleContentCount", { count, limit: ruleContentLimit })),
			near ? h("span", null, t(over ? "ruleContentOverLimit" : "ruleContentNearLimit", { limit: ruleContentLimit })) : null);
	}
	function Field({ label, children, className = "" }) {
		return h("label", { className: "lm-browser-field " + className }, h("span", { className: "lm-browser-field-label" }, label), children);
	}
	// 官方 Menu + MenuItemButton 风格的选中下拉，替代原生 select 控件
	function SelectMenu({ value, options, disabled, onChange, ariaLabel, triggerClassName }) {
		const [open, setOpen] = React.useState(false);
		const current = options.find(option => option.value === value);
		return h(Menu, {
			open,
			onClose: () => setOpen(false),
			align: "start",
			portal: true,
			autoFocus: true,
			listClassName: "lm-browser-select-menu",
			anchor: h(Button, {
				variant: "outline",
				size: "sm",
				type: "button",
				className: "lm-browser-select-trigger" + (triggerClassName ? " " + triggerClassName : ""),
				disabled,
				"aria-label": ariaLabel,
				"aria-haspopup": "menu",
				"aria-expanded": open,
				onClick: () => setOpen(value => !value),
				onKeyDown: event => {
					if (!open && event.key === "ArrowDown") { event.preventDefault(); setOpen(true); }
				},
			},
				h("span", { className: "lm-browser-select-value" }, current ? current.label : (options[0]?.label ?? "")),
				h(IconChevronDownOutlineRegular, { size: 12, "aria-hidden": "true" })),
		}, options.map(option => h(MenuItemButton, {
			key: option.value,
			icon: option.value === value ? h(IconCheckOutlineRegular, { size: 14 }) : undefined,
			onSelect: () => { setOpen(false); onChange(option.value); },
		}, option.label)));
	}

	function CreateDialog({ open, form, setForm, namespaces, busy, error, onClose, onSubmit, t }) {
		React.useEffect(() => {
			if (!open) return;
			const keydown = event => { if (event.key === "Escape" && !busy) onClose(); };
			document.addEventListener("keydown", keydown);
			return () => document.removeEventListener("keydown", keydown);
		}, [open, busy, onClose]);
		if (!open) return null;
		const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
		const ruleTooLong = ruleContentOverLimit(form.kind, form.content);
		return h("div", { className: "lm-browser-modal-backdrop", onMouseDown: event => { if (event.target === event.currentTarget && !busy) onClose(); } },
			h("section", { className: "lm-browser-modal", role: "dialog", "aria-modal": true, "aria-labelledby": "lm-browser-create-title" },
				h("div", { className: "lm-browser-modal-heading" }, h("h2", { id: "lm-browser-create-title" }, t("createTitle")), h(Button, { variant: "ghost", size: "sm", "aria-label": t("close"), disabled: busy, onClick: onClose }, h(IconCloseOutlineRegular, { size: 16 }))),
				h("form", { onSubmit: event => { event.preventDefault(); onSubmit(); } },
					error ? h("p", { className: "lm-browser-error", role: "alert" }, error) : null,
					h(Field, { label: t("namespace") }, h(SelectMenu, { value: form.namespace, options: namespaces.map(row => ({ value: row.namespace, label: row.namespace })), disabled: busy, onChange: value => update("namespace", value), ariaLabel: t("namespace"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("kindLabel") }, h(SelectMenu, { value: form.kind, options: entryKinds.map(value => ({ value, label: kindText(value, t) })), disabled: busy, onChange: value => update("kind", value), ariaLabel: t("kindLabel"), triggerClassName: "lm-browser-input" })),
					h(Field, { label: t("topic") }, h(Input, { value: form.topic, placeholder: t("topicPlaceholder"), disabled: busy, onChange: event => update("topic", event.target.value) })),
					h(Field, { label: t("content") }, h("textarea", { className: "lm-browser-textarea lm-browser-create-content", value: form.content, placeholder: t("contentPlaceholder"), disabled: busy, "aria-describedby": form.kind === "rule" ? "lm-create-rule-length" : undefined, "aria-invalid": ruleTooLong || undefined, onChange: event => update("content", event.target.value) }), h(RuleContentHint, { kind: form.kind, content: form.content, id: "lm-create-rule-length", t })),
					h(Field, { label: t("evidence") }, h(Input, { value: form.evidence, placeholder: t(form.kind === "rule" ? "ruleEvidencePlaceholder" : "evidencePlaceholder"), disabled: busy, onChange: event => update("evidence", event.target.value) })),
					h("div", { className: "lm-browser-modal-actions" }, h(Button, { variant: "outline", type: "button", disabled: busy, onClick: onClose }, t("cancel")), h(Button, { variant: "primary", type: "submit", disabled: busy || !form.namespace || ruleTooLong }, busy ? t("creating") : t("create"))))));
	}
	function IndexUsage({ stats, t }) {
		const [open, setOpen] = React.useState(false);
		const [hovered, setHovered] = React.useState(null);
		const used = Number(stats?.indexChars) || 0;
		const budget = Number(stats?.budgetChars) || 0;
		if (!stats || used <= 0 || budget <= 0) return null;
		const percent = Math.round((used / budget) * 100);
		const over = percent > 100;
		const parts = [
			["head", t("usage.label.head"), Number(stats.headChars) || 0, null],
			["rules", t("usage.label.rules"), Number(stats.rulesChars) || 0, Number(stats.ruleCount) || 0],
			["facts", t("usage.label.facts"), Number(stats.factsChars) || 0, Number(stats.factCount) || 0],
			["sops", t("usage.label.sops"), Number(stats.sopsChars) || 0, Number(stats.sopCount) || 0],
		];
		const dimmed = kind => hovered !== null && hovered !== kind;
		const tipFor = (kind, value, count) => [
			t("usage.tip." + kind),
			count === null ? "" : t("usage.count", { count }),
			t("usage.share", { share: Math.round((value / used) * 100) }),
		].filter(Boolean).join(" · ");
		return h("div", { className: "lm-browser-usage" + (open ? " is-open" : "") },
			h("button", {
				type: "button", className: "lm-usage-summary",
				"aria-expanded": open, "aria-controls": "lm-usage-detail",
				onClick: () => setOpen(!open),
			},
				h("span", { className: "lm-usage-label" }, t("usage.used")),
				h("span", { className: "lm-usage-percent" + (over ? " is-over" : "") }, percent + "%"),
				h("span", { className: "lm-usage-bar", "aria-hidden": "true" },
					parts.map(([kind, , value]) => h("span", {
						key: kind,
						className: "lm-usage-segment lm-usage-color-" + kind + (dimmed(kind) ? " is-dim" : ""),
						style: { width: (percent * value / used) + "%" },
					}))),
				h("span", { className: "lm-usage-figures" }, "~" + t("usage.total", { used: compactChars(used), budget: compactChars(budget) })),
				h(IconChevronDownOutlineRegular, { size: 12, className: "lm-usage-chevron" })),
			h("div", { className: "lm-usage-detail", id: "lm-usage-detail", "aria-hidden": open ? undefined : "true" },
				h("div", { className: "lm-usage-detail-inner" },
					h("div", { className: "lm-usage-legend" },
						parts.map(([kind, term, value, count]) => h("span", {
							key: kind,
							className: "lm-usage-legend-wrap" + (dimmed(kind) ? " is-dim" : ""),
							onMouseEnter: () => setHovered(kind),
							onMouseLeave: () => setHovered(null),
						},
							h(Tooltip, { label: tipFor(kind, value, count), side: "bottom", delayMs: 120 },
								h("span", { className: "lm-usage-legend-item" },
									h("span", { className: "lm-usage-swatch lm-usage-color-" + kind, "aria-hidden": "true" }),
									h("span", { className: "lm-usage-legend-label" }, term),
									h("span", { className: "lm-usage-legend-chars" }, compactChars(value))))))),
					over ? h("p", { className: "lm-usage-over", role: "status" }, t("usage.over")) : null)));
	}
	function MemoryBrowserPage({ controls, t }) {
		const [namespaces, setNamespaces] = React.useState([]);
		const [namespace, setNamespace] = React.useState(null);
		const [namespaceError, setNamespaceError] = React.useState(null);
		const [namespaceBusy, setNamespaceBusy] = React.useState(true);
		const [namespaceVersion, setNamespaceVersion] = React.useState(0);
		const [query, setQuery] = React.useState("");
		const [kind, setKind] = React.useState("");
		const [includeArchived, setIncludeArchived] = React.useState(false);
		const [entries, setEntries] = React.useState([]);
		const [usage, setUsage] = React.useState(null);
		const [listBusy, setListBusy] = React.useState(false);
		const [listError, setListError] = React.useState(null);
		const [selectedId, setSelectedId] = React.useState(null);
		const [detail, setDetail] = React.useState(null);
		const [detailBusy, setDetailBusy] = React.useState(false);
		const [detailError, setDetailError] = React.useState(null);
		const [content, setContent] = React.useState("");
		const [evidence, setEvidence] = React.useState("");
		const [history, setHistory] = React.useState([]);
		const [historyBusy, setHistoryBusy] = React.useState(false);
		const [historyError, setHistoryError] = React.useState(null);
		const [listVersion, setListVersion] = React.useState(0);
		const [detailVersion, setDetailVersion] = React.useState(0);
		const [historyVersion, setHistoryVersion] = React.useState(0);
		const [busy, setBusy] = React.useState(null);
		const [actionError, setActionError] = React.useState(null);
		const [notice, setNotice] = React.useState(null);
		const [conflict, setConflict] = React.useState(false);
		const [rollbackId, setRollbackId] = React.useState(null);
		const [contentPreview, setContentPreview] = React.useState(true);
		const [previewId, setPreviewId] = React.useState(null);
		const [createOpen, setCreateOpen] = React.useState(false);
		const [createForm, setCreateForm] = React.useState({ namespace: "", kind: "fact", topic: "", content: "", evidence: "" });
		const [createError, setCreateError] = React.useState(null);
		const detailRequest = React.useRef(0);
		const historyRequest = React.useRef(0);
		React.useEffect(() => {
			let active = true;
			setNamespaceBusy(true);
			// 首屏时远程命名空间可能尚未就绪，调用会一直悬挂；带超时重试，避免页面空着
			const attempt = async () => {
				for (let index = 0; index < 3; index += 1) {
					if (!active) return;
					try {
						const rows = await Promise.race([
							controls.listNamespaces(),
							new Promise((_, reject) => setTimeout(() => reject(new Error(t("loadTimeout"))), 2500)),
						]);
						if (!active) return;
						setNamespaces(rows);
						setNamespaceError(null);
						setNamespaceBusy(false);
						setNamespace(current => current && rows.some(row => row.namespace === current) ? current : rows[0]?.namespace || null);
						return;
					} catch (error) {
						if (!active) return;
						if (index === 2) { setNamespaceBusy(false); setNamespaceError(error.message); return; }
						await new Promise(resolve => setTimeout(resolve, 400));
					}
				}
			};
			attempt();
			return () => { active = false; };
		}, [controls, namespaceVersion]);
		React.useEffect(() => {
			if (!namespace) { setEntries([]); setSelectedId(null); setListBusy(false); return; }
			let active = true;
			setListBusy(true);
			setListError(null);
			const timer = setTimeout(() => {
				const request = { namespace, includeArchived };
				if (kind) request.kind = kind;
				if (query) request.query = query;
				controls.listEntries(request).then(rows => {
					if (!active) return;
					setEntries(rows);
					setListBusy(false);
					setSelectedId(current => rows.some(row => identity(row.entry) === current) ? current : rows[0] ? identity(rows[0].entry) : null);
				}).catch(error => { if (active) { setListBusy(false); setListError(error.message); } });
			}, 160);
			return () => { active = false; clearTimeout(timer); };
		}, [controls, namespace, kind, query, includeArchived, listVersion]);
		React.useEffect(() => {
			if (!namespace) { setUsage(null); return; }
			let active = true;
			controls.namespaceStats({ namespace }).then(value => {
				if (!active) return;
				setUsage(value);
			}).catch(() => { if (active) setUsage(null); });
			return () => { active = false; };
		}, [controls, namespace, listVersion]);
		React.useEffect(() => {
			const request = ++detailRequest.current;
			const selected = entries.find(row => identity(row.entry) === selectedId);
			setRollbackId(null);
			setPreviewId(null);
			setContentPreview(true);
			if (!selected) { setDetail(null); setDetailBusy(false); setDetailError(null); return; }
			setDetail(null);
			setDetailBusy(true);
			setDetailError(null);
			controls.readEntry({ entry: selected.entry }).then(value => {
				if (request !== detailRequest.current) return;
				setDetail(value);
				setContent(value.content);
				setEvidence(value.evidence);
				setDetailBusy(false);
			}).catch(error => { if (request === detailRequest.current) { setDetailBusy(false); setDetailError(error.message); } });
		}, [controls, selectedId, detailVersion, entries]);
		React.useEffect(() => {
			const request = ++historyRequest.current;
			const selected = entries.find(row => identity(row.entry) === selectedId);
			if (!selected) { setHistory([]); setHistoryBusy(false); setHistoryError(null); return; }
			setHistoryBusy(true);
			setHistoryError(null);
			controls.entryHistory({ entry: selected.entry }).then(rows => {
				if (request !== historyRequest.current) return;
				setHistory(rows);
				setHistoryBusy(false);
			}).catch(error => { if (request === historyRequest.current) { setHistoryBusy(false); setHistoryError(error.message); } });
		}, [controls, selectedId, historyVersion, entries]);
		function refreshAll() {
			setListVersion(value => value + 1);
			setDetailVersion(value => value + 1);
			setHistoryVersion(value => value + 1);
		}
		function reloadDetail() {
			setActionError(null);
			setConflict(false);
			setDetailVersion(value => value + 1);
			setHistoryVersion(value => value + 1);
		}
		function openCreate() {
			setCreateForm({ namespace: namespace || namespaces[0]?.namespace || "", kind: kind || "fact", topic: "", content: "", evidence: "" });
			setCreateError(null);
			setCreateOpen(true);
		}
		async function createEntry() {
			if (ruleContentOverLimit(createForm.kind, createForm.content)) return;
			if (!createForm.namespace || !createForm.topic.trim() || !createForm.content.trim() || !createForm.evidence.trim()) {
				setCreateError(t("requiredFields"));
				return;
			}
			setBusy("create");
			setCreateError(null);
			try {
				const result = await controls.createEntry(createForm);
				setCreateOpen(false);
				setNamespace(result.entry.namespace);
				setKind(result.entry.kind);
				setQuery("");
				setSelectedId(identity(result.entry));
				setNotice(t("created"));
				refreshAll();
			} catch (error) { setCreateError(error.message); }
			finally { setBusy(null); }
		}
		async function saveEntry() {
			if (!detail || ruleContentOverLimit(detail.entry.kind, content)) return;
			setBusy("save");
			setActionError(null);
			setNotice(null);
			setConflict(false);
			try {
				const request = { entry: detail.entry, content, ifRevision: detail.revision };
				if (evidence !== detail.evidence) request.evidence = evidence;
				await controls.updateEntry(request);
				setNotice(t("saved"));
				refreshAll();
			} catch (error) {
				if (error.message.includes("revision_conflict")) setConflict(true);
				setActionError(error.message);
			} finally { setBusy(null); }
		}
		async function toggleArchived() {
			if (!detail) return;
			setBusy("archive");
			setActionError(null);
			setNotice(null);
			try {
				await controls.setArchived({ entry: detail.entry, archived: !detail.archived });
				setNotice(t("archivedDone"));
				refreshAll();
			} catch (error) { setActionError(error.message); }
			finally { setBusy(null); }
		}
		async function rollback(snapshotId) {
			if (!detail) return;
			setBusy("rollback");
			setActionError(null);
			setNotice(null);
			try {
				await controls.rollbackEntry({ entry: detail.entry, snapshotId });
				setRollbackId(null);
				setNotice(t("rolledBack"));
				refreshAll();
			} catch (error) { setActionError(error.message); }
			finally { setBusy(null); }
		}
		function changeText(change) {
			if (!change) return "";
			if (change.initial) return t("initialVersion");
			const parts = [];
			if (change.contentDelta !== null && change.contentDelta !== 0) parts.push(t("contentDelta", { delta: (change.contentDelta > 0 ? "+" : "") + change.contentDelta }));
			if (change.evidenceChanged) parts.push(t("evidenceUpdated"));
			return parts.length ? parts.join(" · ") : t("noContentChange");
		}
		function renderSnapshot(snapshot) {
			const expanded = previewId === snapshot.snapshotId;
			const confirming = rollbackId === snapshot.snapshotId;
			return h("li", { key: snapshot.snapshotId, className: "lm-browser-history-row" },
				h("div", { className: "lm-browser-history-head" },
					h("div", { className: "lm-browser-history-meta" },
						h("time", { dateTime: snapshot.createdAt }, time(snapshot.createdAt)),
						h("code", { title: snapshot.revision }, snapshot.revision.slice(0, 12)),
						h("span", null, t("characters", { count: snapshot.chars }))),
					h("div", { className: "lm-browser-history-tools" },
						h(Button, { variant: "ghost", size: "sm", onClick: () => setPreviewId(expanded ? null : snapshot.snapshotId) }, expanded ? t("collapse") : t("preview")),
						h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: () => setRollbackId(confirming ? null : snapshot.snapshotId) }, t("rollback")))),
				h("div", { className: "lm-browser-history-summary" },
					h("span", { className: "lm-browser-history-summary-text" }, snapshot.summary || t("noSummary")),
					h("span", { className: "lm-browser-history-change" }, changeText(snapshot.change))),
				confirming ? h("div", { className: "lm-browser-rollback-confirm" },
					h("p", null, t("rollbackWarning")),
					h("div", null,
						h(Button, { variant: "ghost", size: "sm", disabled: Boolean(busy), onClick: () => setRollbackId(null) }, t("cancel")),
						h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy), onClick: () => rollback(snapshot.snapshotId) }, t("rollbackConfirm")))) : null,
				expanded ? h("pre", { className: "lm-browser-history-preview" }, snapshot.preview || t("noPreview")) : null);
		}
		const dirty = detail && (content !== detail.content || evidence !== detail.evidence);
		const ruleTooLong = detail && ruleContentOverLimit(detail.entry.kind, content);
		return h("section", { className: "lm-browser-page", "aria-label": t("title"), "data-memory-browser": true },
			h("style", null, styles),
			h("header", { className: "lm-browser-heading" }, h("h1", null, t("title")), h(Button, { variant: "primary", size: "sm", className: "lm-browser-new", icon: h(IconPlusOutlineRegular, { size: 13 }), disabled: !namespaces.length, onClick: openCreate }, t("newEntry"))),
			h("div", { className: "lm-browser-toolbar" },
				h("div", { className: "lm-browser-namespace" }, h(SelectMenu, { value: namespace || "", options: namespaces.length ? namespaces.map(row => ({ value: row.namespace, label: row.namespace })) : [{ value: "", label: namespaceBusy ? t("loading") : t("noNamespace") }], disabled: namespaceBusy || !namespaces.length || Boolean(busy), onChange: value => { setNamespace(value); setNotice(null); setActionError(null); setConflict(false); }, ariaLabel: t("namespace") })),
				h("div", { className: "lm-browser-search" }, h(Input, { type: "search", icon: h(IconSearchOutlineRegular, { size: 14 }), "aria-label": t("search"), placeholder: t("searchPlaceholder"), value: query, onChange: event => setQuery(event.target.value) }), query ? h(Button, { variant: "ghost", size: "sm", className: "lm-browser-search-clear", "aria-label": t("clearSearch"), onClick: () => setQuery("") }, h(IconCloseOutlineRegular, { size: 14 })) : null),
				h("div", { className: "lm-browser-filter-tabs", role: "group", "aria-label": t("kindLabel") }, [["", t("all")], ...entryKinds.map(value => [value, kindText(value, t)])].map(([value, label]) => h("button", { key: value || "all", type: "button", className: "lm-browser-filter-tab" + (kind === value ? " is-active" : ""), "aria-pressed": kind === value, onClick: () => setKind(value) }, label))),
				h("label", { className: "lm-browser-archived-toggle" }, h(Switch, { checked: includeArchived, label: t("showArchived"), onChange: next => setIncludeArchived(next) }), h("span", { "aria-hidden": "true" }, t("showArchived")))),
			h(IndexUsage, { stats: usage, t }),
			namespaceError ? h("div", { className: "lm-browser-error lm-browser-banner", role: "alert" }, h("span", null, namespaceError), h(Button, { variant: "outline", size: "sm", onClick: () => setNamespaceVersion(value => value + 1) }, t("reload"))) : null,
			h("div", { className: "lm-browser-body" },
				h("section", { className: "lm-browser-list-pane", "aria-label": t("entries") },
					listBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
					listError ? h("p", { className: "lm-browser-error", role: "alert" }, listError) : null,
					namespaceBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : (!listBusy && !listError && !entries.length ? h("p", { className: "lm-browser-empty" }, t("empty")) : null),
					h("ul", { className: "lm-browser-list" }, entries.map(row => h("li", { key: identity(row.entry) }, h("button", { type: "button", className: "lm-browser-row" + (selectedId === identity(row.entry) ? " is-selected" : "") + (row.archived ? " is-archived" : ""), onClick: () => { setSelectedId(identity(row.entry)); setNotice(null); setActionError(null); setConflict(false); } },
						h("span", { className: "lm-browser-row-title" }, row.title),
						h("span", { className: "lm-browser-row-meta" }, h("span", { className: "lm-browser-kind" }, kindText(row.entry.kind, t)), row.archived ? h("span", null, t("archived")) : null, row.updatedAt ? h("time", { dateTime: row.updatedAt }, time(row.updatedAt)) : null)))))),
				h("article", { className: "lm-browser-detail" },
					detailBusy && !detail ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
					detailError ? h("div", { className: "lm-browser-detail-message" }, h("p", { className: "lm-browser-error", role: "alert" }, detailError), h(Button, { variant: "outline", size: "sm", onClick: reloadDetail }, t("reload"))) : null,
					!detailBusy && !detailError && !detail ? h("p", { className: "lm-browser-empty" }, t("emptyDetail")) : null,
					detail ? h("div", { className: "lm-browser-detail-scroll" },
						h("div", { className: "lm-browser-detail-heading" },
							h("div", { className: "lm-browser-detail-title" }, h("h2", null, detail.title), detail.archived ? h("span", { className: "lm-browser-archived-badge" }, t("archived")) : null),
							h("div", { className: "lm-browser-detail-actions" },
								notice ? h("span", { className: "lm-browser-inline-notice", role: "status" }, notice) : null,
								h(Button, { variant: "outline", size: "sm", disabled: Boolean(busy), onClick: toggleArchived }, detail.archived ? t("restore") : t("archive")),
								h(Button, { variant: "primary", size: "sm", disabled: Boolean(busy) || !dirty || ruleTooLong, onClick: saveEntry }, busy === "save" ? t("saving") : t("save")))),
						conflict ? h("div", { className: "lm-browser-conflict", role: "alert" }, h("span", null, t("conflict")), h(Button, { variant: "outline", size: "sm", onClick: reloadDetail }, t("reload"))) : null,
						actionError ? h("p", { className: "lm-browser-error", role: "alert" }, actionError) : null,
						h("dl", { className: "lm-browser-readonly" }, [["namespace", detail.entry.namespace], ["kind", kindText(detail.entry.kind, t)], ["key", detail.entry.key]].map(([label, value]) => h("div", { key: label }, h("dt", null, label), h("dd", null, value)))),
						h(Field, { label: h("span", { style: { display: "inline-flex", alignItems: "center", gap: 8 } }, t("content"), h("span", { className: "lm-browser-seg-toggle" },
													h("button", { type: "button", className: "lm-browser-seg-btn" + (contentPreview ? " is-active" : ""), onClick: () => setContentPreview(true) }, t("previewMode")),
													h("button", { type: "button", className: "lm-browser-seg-btn" + (!contentPreview ? " is-active" : ""), onClick: () => setContentPreview(false) }, t("editMode")))) },
									contentPreview
										? h("div", { className: "lm-browser-md-preview", onClick: () => setContentPreview(false) }, renderMarkdown(content))
										: h("textarea", { className: "lm-browser-textarea lm-browser-content", value: content, disabled: Boolean(busy), "aria-describedby": detail.entry.kind === "rule" ? "lm-edit-rule-length" : undefined, "aria-invalid": ruleTooLong || undefined, onChange: event => setContent(event.target.value), onBlur: () => setContentPreview(true) }),
									h(RuleContentHint, { kind: detail.entry.kind, content, id: "lm-edit-rule-length", t })),
						h(Field, { label: t("evidence") }, h(Input, { value: evidence, disabled: Boolean(busy), placeholder: t(detail.entry.kind === "rule" ? "ruleEvidencePlaceholder" : "evidencePlaceholder"), onChange: event => setEvidence(event.target.value) })),
						h("section", { className: "lm-browser-history" },
							h("h3", null, t("history")),
							historyBusy ? h("p", { className: "lm-browser-empty", role: "status" }, t("loading")) : null,
							historyError ? h("p", { className: "lm-browser-error", role: "alert" }, historyError) : null,
							!historyBusy && !historyError && !history.length ? h("p", { className: "lm-browser-muted" }, t("noHistory")) : null,
							h("ol", { className: "lm-browser-history-list" }, history.map(renderSnapshot)))) : null)),
			h(CreateDialog, { open: createOpen, form: createForm, setForm: setCreateForm, namespaces, busy: busy === "create", error: createError, onClose: () => setCreateOpen(false), onSubmit: createEntry, t }));
	}
	return {
		inject: ["remote"],
		async apply(ctx) {
			const ui = ctx.inject(["remote.layeredMemoryStatus", "slots", "locale"], scope => {
				scope.effect(() => scope.locale.register(locale, dictionaries), "memory-browser: locale");
				const controls = {
					listNamespaces: () => resultValue(scope.remote.layeredMemoryStatus.listNamespaces()),
					namespaceStats: request => resultValue(scope.remote.layeredMemoryStatus.namespaceStats(request)),
					listEntries: request => resultValue(scope.remote.layeredMemoryStatus.listEntries(request)),
					readEntry: request => resultValue(scope.remote.layeredMemoryStatus.readEntry(request)),
					createEntry: request => resultValue(scope.remote.layeredMemoryStatus.createEntry(request)),
					updateEntry: request => resultValue(scope.remote.layeredMemoryStatus.updateEntry(request)),
					setArchived: request => resultValue(scope.remote.layeredMemoryStatus.setArchived(request)),
					entryHistory: request => resultValue(scope.remote.layeredMemoryStatus.entryHistory(request)),
					rollbackEntry: request => resultValue(scope.remote.layeredMemoryStatus.rollbackEntry(request)),
				};
				scope.slots.inject("main", () => scope.slots.register({ name: "main", key: "layered-memory", locale, inject: () => ({ controls }) }, MemoryBrowserPage));
				scope.slots.inject("sidebar.panellist", () => scope.slots.register({ name: "sidebar.panellist", id: "layered-memory", order: 20, locale, label: () => scope.locale.translate(locale, "title") }, MemoryBrowserIcon));
			});
			try { await ui; }
			catch (error) { await ui.dispose(); throw error; }
			return async () => { await ui.dispose(); };
		},
	};
}
