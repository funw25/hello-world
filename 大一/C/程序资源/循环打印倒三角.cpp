//循环输出星号三角形
//输出n行"*"号组成的倒三角图案（注意第一行的最左边没有空格） 
#include <stdio.h>
int main()
{
    int i, j, n;
    scanf("%d", &n);
    for (i = 1; i <= n; i++)//行数 
    {
        for (j = 1; j<=i-1; j++){//输出第i行的i-1个空格 
            printf(" ");
    	}
        for (j= 1; j<=n-(i-1); j++){//输出星号 
            printf("* ");
        }
        printf("\n");
    }
    return 0;
}
