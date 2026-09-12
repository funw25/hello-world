//输入一个整数N(1<=N<=10)，输出N！
#include"stdio.h"
int fun(int n){
	if(n==1){
		return 1;
	}
	else{
		return n*fun(n-1);
	}
}
int main()
{
	int n;
	scanf("%d",&n);
	printf("%d",fun(n));
	return 0;
}

