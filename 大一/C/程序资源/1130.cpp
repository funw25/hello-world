//从键盘输入一个正整数， 编写递归函数将其逆序数出。例如输入256，输出652。
//如果n小于10，则直接输出n，否则（1）输出个位数n%10，(2) 递归调用逆序函数输出n/10的逆序数
#include"stdio.h" 
void nx(int n)
{
	if(n<10){
		printf("%d",n);
	}
	else{
		printf("%d",n%10);
		nx(n/10);
	}
}
int main()
{
	int n;
	scanf("%d",&n);
	nx(n);
	printf("\n");
	return 0;
}

