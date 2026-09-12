//利用递归实现1+2+3+...+100
#include"stdio.h"
int sum(int n)
{
	if(n==1){
		return 1;
	}
	else{
		return n+sum(n-1);
	}
}
int main()
{
	printf("sum=%d",sum(100));
	return 0;
}
