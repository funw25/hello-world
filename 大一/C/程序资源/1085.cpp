//从键盘上输入两个正整数m 和n，编程输出m 和n 之间的个位数为7 所有素数。
#include <stdio.h>
#include <math.h>

int main() {
    int j, m,n,i;
    scanf("%d,%d",&m,&n); 
    for (j = m; j <= n; j++) {
        if (j % 10 != 7) 
		continue;
        int isPrime = 1;  
        for (i = 2; i <= sqrt(j); i++) {
            if (j % i == 0) {
                // 如果能被整除，说明不是素数，标记为0并跳出循环
                isPrime = 0;  
                break;
            }
        }// 如果经过上述循环后isPrime仍为1，说明是素数，输出该数
        if (isPrime == 1) {
            printf("%d ", j);
        }
    }
    return 0;
}

