export default {
  route: {
    dashboard: 'Dashboard',
    introduction: 'Introduction',
    documentation: 'Documentation',
    guide: 'Guide',
    permission: 'Permission',
    pagePermission: 'Permission de Page',
    directivePermission: 'Permission en directive',
    icons: 'Icônes',
    components: 'Composantes',
    componentIndex: 'Introduction',
    tinymce: 'Tinymce',
    markdown: 'Markdown',
    jsonEditor: 'Éditeur JSON',
    dndList: 'Liste Dnd',
    splitPane: 'Paneau Partagé',
    avatarUpload: 'Téléverser un Avatar',
    dropzone: 'Déplacer image ici',
    sticky: 'Permanent',
    countTo: 'Compter',
    componentMixin: 'Mixin',
    backToTop: 'RetourVersLeHaut',
    dragDialog: 'Drag Dialog',
    dragKanban: 'Drag Kanban',
    charts: 'Graphiques',
    keyboardChart: 'Keyboard Chart',
    lineChart: 'Graphique Ligne',
    mixChart: 'Graphique Mix',
    example: 'Example',
    nested: 'Nested Routes',
    menu1: 'Menu 1',
    'menu1-1': 'Menu 1-1',
    'menu1-2': 'Menu 1-2',
    'menu1-2-1': 'Menu 1-2-1',
    'menu1-2-2': 'Menu 1-2-2',
    'menu1-3': 'Menu 1-3',
    menu2: 'Menu 2',
    Table: 'Tableau',
    dynamicTable: 'Tableau Dynamique',
    dragTable: 'Tableau Déplacable',
    inlineEditTable: 'Éditer Inline',
    complexTable: 'Tableau Complexe',
    treeTable: 'Tableau Hierchique',
    customTreeTable: 'Custom TreeTable',
    tab: 'Tab',
    form: 'Formulaire',
    createArticle: 'Créé un Article',
    editArticle: 'Mettre a jour un Article',
    articleList: 'Liste des Articles',
    errorPages: 'Pages d\'Erreur',
    page401: '401',
    page404: '404',
    errorLog: 'Erreur Log',
    excel: 'Excel',
    exportExcel: 'Export Excel',
    selectExcel: 'Export Selected',
    uploadExcel: 'Upload Excel',
    zip: 'Zip',
    exportZip: 'Export Zip',
    theme: 'Theme',
    clipboardDemo: 'Clipboard',
    i18n: 'I18n',
    externalLink: 'External Link'
  },
  navbar: {
    logOut: 'Se déconnecter',
    dashboard: 'Dashboard',
    github: 'Github',
    screenfull: 'Plein Écran',
    theme: 'Theme',
    size: 'Grandeur de Texte'
  },
  language: {
    switchSuccess: 'Changement de langue complété avec succès'
  },
  login: {
    title: 'Connexion à Mon Espace',
    logIn: 'Se connecter',
    signUp: 'Créer mon compte',
    invalidPassword: 'L\'authentication a échoué. Vérifier votre courril ainsi que votre mot de passe',
    PasswordDigitRequirements: 'Le mot de passe doit avoir plus de 6 caractères',
    UsernameEmailRequirements: 'Le nom d\'utilisateur doit être un addresse courriel valide.',
    username: 'Mon addresse courriel',
    password: 'Mon mot de passe',
    any: 'any',
    thirdparty: 'Se connecter avec ...',
    thirdpartyTips: 'Can not be simulated on local, so please combine you own business simulation! ! !'
  },
  documentation: {
    documentation: 'Documentation',
    github: 'Github Repository'
  },
  permission: {
    roles: 'Your roles',
    switchRoles: 'Switch roles'
  },
  guide: {
    description: 'The guide page is useful for some people who entered the project for the first time. You can briefly introduce the features of the project. Demo is based on ',
    button: 'Show Guide'
  },
  components: {
    documentation: 'Documentation',
    tinymceTips: 'Rich text editor is a core part of management system, but at the same time is a place with lots of problems. In the process of selecting rich texts, I also walked a lot of detours. The common rich text editors in the market are basically used, and the finally chose Tinymce. See documentation for more detailed rich text editor comparisons and introductions.',
    dropzoneTips: 'Because my business has special needs, and has to upload images to qiniu, so instead of a third party, I chose encapsulate it by myself. It is very simple, you can see the detail code in @/components/Dropzone.',
    stickyTips: 'when the page is scrolled to the preset position will be sticky on the top.',
    backToTopTips1: 'When the page is scrolled to the specified position, the Back to Top button appears in the lower right corner',
    backToTopTips2: 'You can customize the style of the button, show / hide, height of appearance, height of the return. If you need a text prompt, you can use element-ui el-tooltip elements externally',
    imageUploadTips: 'Since I was using only the vue@1 version, and it is not compatible with mockjs at the moment, I modified it myself, and if you are going to use it, it is better to use official version.'
  },
  table: {
    dynamicTips1: 'Fixed header, sorted by header order',
    dynamicTips2: 'Not fixed header, sorted by click order',
    dragTips1: 'The default order',
    dragTips2: 'The after dragging order',
    title: 'Title',
    importance: 'Imp',
    type: 'Type',
    remark: 'Remark',
    search: 'Search',
    add: 'Add',
    export: 'Export',
    reviewer: 'reviewer',
    id: 'ID',
    date: 'Date',
    author: 'Author',
    readings: 'Readings',
    status: 'Status',
    actions: 'Actions',
    edit: 'Edit',
    publish: 'Publish',
    draft: 'Draft',
    delete: 'Delete',
    cancel: 'Cancel',
    confirm: 'Confirm'
  },
  errorLog: {
    tips: 'Please click the bug icon in the upper right corner',
    description: 'Now the management system are basically the form of the spa, it enhances the user experience, but it also increases the possibility of page problems, a small negligence may lead to the entire page deadlock. Fortunately Vue provides a way to catch handling exceptions, where you can handle errors or report exceptions.',
    documentation: 'Document introduction'
  },
  excel: {
    export: 'Export',
    selectedExport: 'Export Selected Items',
    placeholder: 'Please enter the file name(default excel-list)'
  },
  zip: {
    export: 'Export',
    placeholder: 'Please enter the file name(default file)'
  },
  theme: {
    change: 'Change Theme',
    documentation: 'Theme documentation',
    tips: 'Tips: It is different from the theme-pick on the navbar is two different skinning methods, each with different application scenarios. Refer to the documentation for details.'
  },
  tagsView: {
    refresh: 'Refresh',
    close: 'Close',
    closeOthers: 'Close Others',
    closeAll: 'Close All'
  }
}
