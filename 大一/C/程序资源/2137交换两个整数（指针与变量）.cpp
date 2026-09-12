//输入两个整数，要求使用指针交换两个整数的值
#include"stdio.h" 
int main()
{
	int a,b,t;
	scanf("%d %d",&a,&b);
	int *p=&a;
	int *q=&b;
	t=*p;
	*p=*q;
	*q=t;
	printf("%d %d",a,b);
	return 0;
}
