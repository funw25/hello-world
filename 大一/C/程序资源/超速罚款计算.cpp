//超出本车道限速的10%(不包含)则处200元罚款；
//若超出50%(不包含)，就要吊销驾驶证。
//在一行中输出处理意见：若属于正常行驶，则输出“OK”；
//若应处罚款，则输出“Exceed x%.Ticket 200”；
//若应吊销驾驶证，则输出“Exceed x%.License Revoked”。
//其中x是超速的百分比，精确到整数
#include<stdio.h> 
int main()
{
	int a,b,x; 
	scanf("%d %d",&a,&b);
	x=100*(a-b)/b;
	if(((a-b)>0.1*b)&&((a-b)<0.5*b)){
		printf("Exceed %d%%.Ticket 200",x);
	}
	else if((a-b)<=0.1*b){
		printf("OK"); 
	}
	else{
	    printf("Exceed %d%%.License Revoked",x); 
	}
	return 0;
}
