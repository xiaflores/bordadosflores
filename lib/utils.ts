/**
 * Formats a numeric amount to Bolivianos (Bs.) currency style.
 * @param amount Number to format
 * @param showDecimals If true, formats with two decimal places
 */
export function formatCurrency(amount: number, showDecimals: boolean = false): string {
  if (showDecimals || amount % 1 !== 0) {
    return `Bs. ${amount.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `Bs. ${amount.toLocaleString('es-BO')}`;
}
