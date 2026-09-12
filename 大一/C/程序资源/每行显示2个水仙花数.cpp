//每行显示2个水仙花数
#include"stdio.h"
#include"math.h"

int main() {
    int m, n;
    scanf("%d %d", &m, &n);

    int count = 0;  // 用于计数，控制每行输出2个数字
    for (int i = m; i <= n; i++) {
        int temp = i;
        int sum = 0;
        while (temp) {
            int digit = temp % 10;
            sum += pow(digit, 3);
            temp /= 10;
        }
        if (sum == i) {
            printf("%d ", i);
            count++;
            if (count % 2 == 0) {//count是 2 的倍数时，换行输出。
                printf("\n");
            }
        }
    }
    return 0;
}

