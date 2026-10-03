const pad = (n: number) => String(n).padStart(2, "0");

export function monthAt(today: string, offset: number) {
  const total = +today.slice(0, 4) * 12 + (+today.slice(5, 7) - 1) + offset;
  const y = Math.floor(total / 12), m = total % 12;
  return { y, m, key: `${y}-${pad(m + 1)}` };
}

export const nextMonthStart = (month: string) => `${monthAt(`${month}-01`, 1).key}-01`;
