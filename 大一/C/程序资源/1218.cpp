//输入3个数，用指针的方法实现由小到大输出。
#include"stdio.h"
int main()
{
	int a,b,c;
	scanf("%d %d %d",&a,&b,&c);
	int *p1=&a;
	int *p2=&b;
	int *p3=&c;
	if(*p1>*p2){
		int t=*p1;
		*p1=*p2;
		*p2=t;
	}
	if(*p1>*p3){
		int k=*p1;
		*p1=*p3;
		*p3=k;
	}
	if(*p3<*p2){
		int j=*p3;
		*p3=*p2;
		*p2=j;
	}
	printf("%d %d %d",*p1,*p2,*p3);
	return 0;
}
