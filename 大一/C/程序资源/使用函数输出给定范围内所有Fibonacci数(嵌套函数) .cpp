
//函数PrintFN要在一行中输出给定范围[m, n]内的所有Fibonacci数，相邻数字间有一个空格，行末不得有多余空格。
//如果给定区间内没有Fibonacci数，则输出一行“No Fibonacci number”。
//本题要求实现一个计算Fibonacci数的简单函数，并利用该函数实现另一个函数输出两正整数m和n（0<m≤n≤10000）之间的所有Fibonacci数。
//所谓Fibonacci数列就是满足任一项数字是前两项的和（最开始两项均定义为1）的数列。
//第1行输入3个整数，前两个数表示区间的两个端点m和n，第3个数t表示要求计算Fibonacci数列中第t项的值

#include <stdio.h>
int fib( int n );
void PrintFN( int m, int n );
int main()
{
    int m, n, t;
    scanf("%d %d %d", &m, &n, &t);
    printf("fib(%d) = %d\n", t, fib(t));
    PrintFN(m, n);
    return 0;
}
int fib(int n) {
    if (n == 1 || n == 2) {
        return 1;
    } else {
        int a = 1, b = 1, c;
        for (int i = 3; i <= n; i++) {
            c = a + b;
            a = b;
            b = c;
        }
        return c;
    }
}

// 输出m和n之间的Fibonacci数
void PrintFN(int m, int n) {
    int found = 0;
    int i = 1;
    int f;
    while (1) {
        f = fib(i);
        if (f >= m && f <= n) {
            if (found) {
                printf(" ");
            }
            printf("%d", f);
            found = 1;
        } else if (f > n) {
            break;
        }
        i++;
    }
    if (!found) {
        printf("No Fibonacci number");
    }
    printf("\n");
}
