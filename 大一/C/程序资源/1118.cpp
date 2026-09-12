//本题要求实现求Fabonacci数列项的函数。Fabonacci数列的定义如下： 
//f(1)=f(2)=1;
//f(n)=f(n-1)+f(n-2) n>=3
//函数f应返回第n个Fabonacci数
#include <stdio.h>
int f( int n );
int main()
{
    int n;
    scanf("%d", &n);
    printf("%d\n", f(n));
    return 0;
}
int f( int n )
{
	if(n==1||n==2){
		return 1;
	}
	else{
		return f(n-1)+f(n-2);
	}
}

