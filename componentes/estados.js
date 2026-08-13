/* Y Soft — estados de carga, vacío, error y modo revisión local. */
(function () { const D = window.YSoft = window.YSoft || {}; D.EmptyState = ({ title, detail }) => D.h('div',{className:'empty-state'},[D.h('strong',null,title),D.h('p',null,detail)]); })();
