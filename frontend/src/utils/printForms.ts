import i18n from '../i18n';
import { exportToPrint } from './export';

/** Приходный кассовый ордер (ПКО) */
export function printPKO(data: {
  number: string; date: string; amount: number; currency?: string;
  fromWhom: string; basis: string; appendix?: string;
}) {
  const c = data.currency || 'UZS';
  const t = i18n.t.bind(i18n);
  const html = `
    <h1 style="text-align:center">${t('printForms.pko_title', 'ПРИХОДНЫЙ КАССОВЫЙ ОРДЕР')} №${data.number}</h1>
    <p style="text-align:center">${t('printForms.from_date', 'от')} ${data.date}</p>
    <table style="width:100%">
      <tr><th style="width:40%">${t('printForms.received_from', 'Принято от')}:</th><td>${data.fromWhom}</td></tr>
      <tr><th>${t('printForms.basis', 'Основание')}:</th><td>${data.basis}</td></tr>
      <tr><th>${t('printForms.amount', 'Сумма')}:</th><td><strong>${data.amount.toLocaleString('ru-RU')} ${c}</strong></td></tr>
      ${data.appendix ? `<tr><th>${t('printForms.appendix', 'Приложение')}:</th><td>${data.appendix}</td></tr>` : ''}
    </table>
    <div class="stamp">
      <div>${t('printForms.chief_accountant', 'Главный бухгалтер')} ____________</div>
      <div>${t('printForms.cashier', 'Кассир')} ____________</div>
    </div>
    <hr style="border-style:dashed; margin:30px 0"/>
    <h2 style="text-align:center">${t('printForms.pko_receipt', 'КВИТАНЦИЯ к ПКО')} №${data.number}</h2>
    <p>${t('printForms.received_from', 'Принято от')}: ${data.fromWhom}</p>
    <p>${t('printForms.amount', 'Сумма')}: <strong>${data.amount.toLocaleString('ru-RU')} ${c}</strong></p>
    <p>${t('printForms.basis', 'Основание')}: ${data.basis}</p>
    <div class="stamp">
      <div>${t('printForms.cashier', 'Кассир')} ____________</div>
      <div>${t('printForms.stamp', 'М.П.')}</div>
    </div>`;
  exportToPrint(`${t('printForms.pko_short', 'ПКО')} №${data.number}`, html);
}

/** Расходный кассовый ордер (РКО) */
export function printRKO(data: {
  number: string; date: string; amount: number; currency?: string;
  toWhom: string; basis: string; byDocument?: string;
}) {
  const c = data.currency || 'UZS';
  const t = i18n.t.bind(i18n);
  const html = `
    <h1 style="text-align:center">${t('printForms.rko_title', 'РАСХОДНЫЙ КАССОВЫЙ ОРДЕР')} №${data.number}</h1>
    <p style="text-align:center">${t('printForms.from_date', 'от')} ${data.date}</p>
    <table style="width:100%">
      <tr><th style="width:40%">${t('printForms.issue_to', 'Выдать')}:</th><td>${data.toWhom}</td></tr>
      <tr><th>${t('printForms.basis', 'Основание')}:</th><td>${data.basis}</td></tr>
      <tr><th>${t('printForms.amount', 'Сумма')}:</th><td><strong>${data.amount.toLocaleString('ru-RU')} ${c}</strong></td></tr>
      ${data.byDocument ? `<tr><th>${t('printForms.by_document', 'По документу')}:</th><td>${data.byDocument}</td></tr>` : ''}
    </table>
    <div class="stamp">
      <div>${t('printForms.director', 'Руководитель')} ____________</div>
      <div>${t('printForms.chief_accountant', 'Главный бухгалтер')} ____________</div>
    </div>
    <p style="margin-top:30px">${t('printForms.received', 'Получил')}: ____________ ${t('printForms.signature', 'Подпись')}: ____________ ${t('printForms.date', 'Дата')}: ____________</p>
    <p>${t('printForms.issued_by_cashier', 'Выдал кассир')}: ____________</p>`;
  exportToPrint(`${t('printForms.rko_short', 'РКО')} №${data.number}`, html);
}

/** Товарно-транспортная накладная (ТТН) */
export function printTTN(data: {
  number: string; date: string;
  sender: string; senderINN?: string;
  receiver: string; receiverINN?: string;
  items: { name: string; unit: string; qty: number; price: number }[];
  currency?: string;
}) {
  const c = data.currency || 'UZS';
  const t = i18n.t.bind(i18n);
  let itemsHtml = data.items.map((item, i) =>
    `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.unit}</td>
         <td class="right">${item.qty}</td><td class="right">${item.price.toLocaleString('ru-RU')}</td>
         <td class="right">${(item.qty * item.price).toLocaleString('ru-RU')}</td></tr>`
  ).join('');
  const total = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const nds = Math.round(total * 0.12);

  const html = `
    <h1 style="text-align:center">${t('printForms.ttn_title', 'ТОВАРНО-ТРАНСПОРТНАЯ НАКЛАДНАЯ')} №${data.number}</h1>
    <p style="text-align:center">${t('printForms.from_date', 'от')} ${data.date}</p>
    <table>
      <tr><th>${t('printForms.sender', 'Грузоотправитель')}:</th><td>${data.sender} ${data.senderINN ? `(${t('printForms.inn', 'ИНН')}: ${data.senderINN})` : ''}</td></tr>
      <tr><th>${t('printForms.receiver', 'Грузополучатель')}:</th><td>${data.receiver} ${data.receiverINN ? `(${t('printForms.inn', 'ИНН')}: ${data.receiverINN})` : ''}</td></tr>
    </table>
    <h2>${t('printForms.product_section', 'Товарный раздел')}</h2>
    <table>
      <thead><tr><th>№</th><th>${t('printForms.name', 'Наименование')}</th><th>${t('printForms.unit', 'Ед.')}</th><th>${t('printForms.qty', 'Кол-во')}</th><th>${t('printForms.price', 'Цена')}</th><th>${t('printForms.amount', 'Сумма')}</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr><th colspan="5" style="text-align:right">${t('printForms.total_without_nds', 'Итого без НДС')}:</th><td class="right"><strong>${total.toLocaleString('ru-RU')} ${c}</strong></td></tr>
        <tr><th colspan="5" style="text-align:right">${t('printForms.nds_12', 'НДС 12%')}:</th><td class="right">${nds.toLocaleString('ru-RU')} ${c}</td></tr>
        <tr><th colspan="5" style="text-align:right">${t('printForms.total_with_nds', 'Всего с НДС')}:</th><td class="right"><strong>${(total + nds).toLocaleString('ru-RU')} ${c}</strong></td></tr>
      </tfoot>
    </table>
    <div class="stamp">
      <div>${t('printForms.released', 'Отпустил')} ____________</div>
      <div>${t('printForms.accepted', 'Принял')} ____________</div>
    </div>`;
  exportToPrint(`${t('printForms.ttn_short', 'ТТН')} №${data.number}`, html);
}

/** Акт выполненных работ */
export function printAct(data: {
  number: string; date: string;
  executor: string; executorINN?: string;
  client: string; clientINN?: string;
  contractNumber?: string; contractDate?: string;
  items: { name: string; unit: string; qty: number; price: number }[];
  currency?: string;
}) {
  const c = data.currency || 'UZS';
  const t = i18n.t.bind(i18n);
  let itemsHtml = data.items.map((item, i) =>
    `<tr><td>${i + 1}</td><td>${item.name}</td><td>${item.unit}</td>
         <td class="right">${item.qty}</td><td class="right">${item.price.toLocaleString('ru-RU')}</td>
         <td class="right">${(item.qty * item.price).toLocaleString('ru-RU')}</td></tr>`
  ).join('');
  const total = data.items.reduce((s, i) => s + i.qty * i.price, 0);
  const nds = Math.round(total * 0.12);

  const html = `
    <h1 style="text-align:center">${t('printForms.act_title', 'АКТ ВЫПОЛНЕННЫХ РАБОТ (ОКАЗАННЫХ УСЛУГ)')}</h1>
    <h2 style="text-align:center">№${data.number} ${t('printForms.from_date', 'от')} ${data.date}</h2>
    ${data.contractNumber ? `<p>${t('printForms.to_contract', 'К договору')} №${data.contractNumber} ${t('printForms.from_date', 'от')} ${data.contractDate || '___'}</p>` : ''}
    <table>
      <tr><th>${t('printForms.executor', 'Исполнитель')}:</th><td>${data.executor} ${data.executorINN ? `(${t('printForms.inn', 'ИНН')}: ${data.executorINN})` : ''}</td></tr>
      <tr><th>${t('printForms.client', 'Заказчик')}:</th><td>${data.client} ${data.clientINN ? `(${t('printForms.inn', 'ИНН')}: ${data.clientINN})` : ''}</td></tr>
    </table>
    <p>${t('printForms.act_desc', 'Исполнитель выполнил, а Заказчик принял следующие работы (услуги):')}</p>
    <table>
      <thead><tr><th>№</th><th>${t('printForms.name', 'Наименование')}</th><th>${t('printForms.unit', 'Ед.')}</th><th>${t('printForms.qty', 'Кол-во')}</th><th>${t('printForms.price', 'Цена')}</th><th>${t('printForms.amount', 'Сумма')}</th></tr></thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr><th colspan="5" style="text-align:right">${t('printForms.total_without_nds', 'Итого без НДС')}:</th><td class="right"><strong>${total.toLocaleString('ru-RU')} ${c}</strong></td></tr>
        <tr><th colspan="5" style="text-align:right">${t('printForms.nds_12', 'НДС 12%')}:</th><td class="right">${nds.toLocaleString('ru-RU')} ${c}</td></tr>
        <tr><th colspan="5" style="text-align:right">${t('printForms.total_with_nds', 'Всего с НДС')}:</th><td class="right"><strong>${(total + nds).toLocaleString('ru-RU')} ${c}</strong></td></tr>
      </tfoot>
    </table>
    <p style="margin-top:20px">${t('printForms.act_footer', 'Вышеперечисленные работы (услуги) выполнены полностью и в срок. Заказчик претензий по объёму, качеству и срокам оказания услуг не имеет.')}</p>
    <div class="stamp">
      <div>${t('printForms.executor', 'Исполнитель')} ____________<br/>${t('printForms.stamp', 'М.П.')}</div>
      <div>${t('printForms.client', 'Заказчик')} ____________<br/>${t('printForms.stamp', 'М.П.')}</div>
    </div>`;
  exportToPrint(`${t('printForms.act_short', 'Акт')} №${data.number}`, html);
}

/** Расчётный лист сотрудника */
export function printPayslip(data: {
  employeeName: string; employeeNumber: string; position: string; department: string;
  period: string; baseSalary: number; bonuses: number;
  ndfl: number; inps: number; esn: number; deductions: number; netSalary: number;
}) {
  const t = i18n.t.bind(i18n);
  const html = `
    <h1 style="text-align:center">${t('printForms.payslip_title', 'РАСЧЁТНЫЙ ЛИСТ')}</h1>
    <h2 style="text-align:center">${t('printForms.for_period', 'за')} ${data.period}</h2>
    <table>
      <tr><th>${t('printForms.employee', 'Сотрудник')}:</th><td>${data.employeeName} (${data.employeeNumber})</td></tr>
      <tr><th>${t('printForms.position', 'Должность')}:</th><td>${data.position}</td></tr>
      <tr><th>${t('printForms.department', 'Подразделение')}:</th><td>${data.department}</td></tr>
    </table>
    <h2>${t('printForms.accrued', 'Начислено')}</h2>
    <table>
      <tr><td>${t('printForms.base_salary', 'Оклад')}</td><td class="right">${data.baseSalary.toLocaleString('ru-RU')} UZS</td></tr>
      <tr><td>${t('printForms.bonuses', 'Премии / надбавки')}</td><td class="right">${data.bonuses.toLocaleString('ru-RU')} UZS</td></tr>
      <tr><th>${t('printForms.total_accrued', 'Итого начислено')}</th><td class="right"><strong>${(data.baseSalary + data.bonuses).toLocaleString('ru-RU')} UZS</strong></td></tr>
    </table>
    <h2>${t('printForms.deducted', 'Удержано')}</h2>
    <table>
      <tr><td>${t('printForms.ndfl', 'НДФЛ (12%)')}</td><td class="right">${data.ndfl.toLocaleString('ru-RU')} UZS</td></tr>
      <tr><td>${t('printForms.inps', 'ИНПС (1%)')}</td><td class="right">${data.inps.toLocaleString('ru-RU')} UZS</td></tr>
      <tr><td>${t('printForms.other_deductions', 'Прочие удержания')}</td><td class="right">${data.deductions.toLocaleString('ru-RU')} UZS</td></tr>
      <tr><th>${t('printForms.total_deducted', 'Итого удержано')}</th><td class="right"><strong>${(data.ndfl + data.inps + data.deductions).toLocaleString('ru-RU')} UZS</strong></td></tr>
    </table>
    <h2>${t('printForms.to_pay', 'К выплате')}</h2>
    <table>
      <tr><th>${t('printForms.amount_to_pay', 'Сумма к выплате')}</th><td class="right" style="font-size:16pt"><strong>${data.netSalary.toLocaleString('ru-RU')} UZS</strong></td></tr>
    </table>
    <p style="margin-top:10px; font-size:9pt; color:#666">${t('printForms.esn_note', 'ЕСН (12%, за счёт работодателя)')}: ${data.esn.toLocaleString('ru-RU')} UZS</p>
    <div class="stamp">
      <div>${t('printForms.accountant', 'Бухгалтер')} ____________</div>
      <div>${t('printForms.employee', 'Сотрудник')} ____________</div>
    </div>`;
  exportToPrint(`${t('printForms.payslip_short', 'Расчётный лист')} — ${data.employeeName}`, html);
}
