//计算e的近似值 
//e可以用级数1+1/1!+1/2!+...+1/n!来近似计算。
//本题要求根据给定的非负整数n，求该级数的前n项和。
#include<stdio.h>
int main()
{
    int n,i;
    double sum=1,j=1;
    scanf("%d",&n);
    for(i=1;i<=n;i++){
		j=j*i;
		sum=sum+1/j;
	}
	printf("%.8lf",sum);
    return 0;
}
