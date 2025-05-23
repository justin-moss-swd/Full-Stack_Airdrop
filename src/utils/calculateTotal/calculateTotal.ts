export function calculateTotal(amounts: string): number {
    const amountArray = amounts
        .split(/[\n,]/)
        .map(amount => amount.trim())
        .filter(amount => amount !== '')
        .map((amount: string) => parseFloat(amount)
    );

    return amountArray 
        .filter(num => !isNaN(num))
        .reduce((sum, num) => sum + num, 0);
}