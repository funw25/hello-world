#include<stdio.h>
int main()
{
	int key,number;
	scanf("%d",&key);
	if(key==123456){
		scanf("%d",&number);
		switch(number)
		{
			case 1:printf("查询余额功能\n");break;
			case 2:printf("取款功能\n");break;
			case 3:printf("存款功能\n");break;
			case 4:printf("转账功能\n");break;
			case 5:printf("打印清单功能\n");break;
			case 6:printf("退款功能\n");break; 
		}
	}
	else{
		printf("密码错误"); 
	}
	return 0;
}
