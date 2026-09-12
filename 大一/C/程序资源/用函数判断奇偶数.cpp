//定义一个判断奇偶数的函数even (n)，当n为偶数时返回1，否则返回0。

#include<stdio.h>
int even(int a)
{
	if(a%2==0){
		a=1;
	}
	else{
		a=0;
	}
	return a;
}

int main(void) {
	int i,n,s=0;
	scanf("%d",&n);
	for(i=1; i<=n; i++) {
		if(even(i)==1) s=s+i;
	}
	printf("%d",s);
	return 0;
}

