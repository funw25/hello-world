#include<stdio.h> 
int main()
{
	float x,c;
	scanf("%f",&x);
	if(x<=50&&x>0){
		c=0.53*x;
		printf("cost=%.2f",c);
	}
	else if(x>50){
		c=(0.53*50)+(x-50)*0.58;
		printf("cost=%.2f",c);
	}
	else{
		printf("Invalid Value!");
	}
	return 0;
}
