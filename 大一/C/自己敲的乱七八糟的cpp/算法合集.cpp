/*
判断一个数字是否是素数 
只用一个函数实现，不好，代码的利用率不高 
*/
#include<stdio.h>
int main(void)
{
	int i;
	int val;
	
	scanf("%d",&val);
	
	for(i=2;i<val;++i)
	{
		if(val%i==0)
		  break;
		
	}
	if(i==val)
	  printf("Yes!\n");
	else
	  printf("No!\n");
	  
	  
	  
	return 0;
}

