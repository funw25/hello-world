//从整数1开始逐步变大，求出能被3整除的整数及这些数的累加和，当和的值大于n时停止。
#include"stdio.h" 
int main()
{
	int i=1,n,sum=0;
	scanf("%d",&n);
	
	do{
		if(i%3==0){
			sum+=i;
			printf("%d ",i);
			i++;
		}
		else{
			i++;
		}
	}
	while(sum<=n);
	printf("%d",sum);
	return 0;
}
