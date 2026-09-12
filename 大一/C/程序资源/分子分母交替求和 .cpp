//输入一个正整数n，
//输出2/1-3/2+5/3-8/5+...的前n项之和，结果保留2位小数
#include"stdio.h"
int main()
{
    int n,sign=1;
    scanf("%d",&n);
    double a=2,b=1,sum=0,t;
    for(int i=0;i<n;i++){
        sum+=sign*(a/b);
        t=a;
        a=a+b;
        b=t;
        sign=-sign;
    }
    printf("sum=%.2f",sum);
    return 0;
}
