//编写一个计算Fibonacci数列的递归函数，要求在主程序中实现数据的输入输出。
//其中Fibonacci数列的组成规律为1,1,2,3,5,8, ……
#include"stdio.h"
int fib(int n)
{
	int result;
	if(n==1||n==2){
		return 1;
	}
	else{
		return fib(n-1)+fib(n-2);
	}
}
int main()
{
	int n;
	scanf("%d",&n);
	for(int i=1;i<=n;i++){
		if (i > 1) {
            printf(",");
        }
        printf("%d", fib(i));
    }
    printf("\n");
	return 0;
}
