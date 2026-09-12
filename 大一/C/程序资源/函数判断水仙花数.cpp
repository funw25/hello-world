//定义一个函数isPPDI判断给定的数是否为水仙花数
//（水仙花数是一个三位数且该数等于各位上的数字立方之和。
//注意如果不是三位数则认为不是水仙花数，例如1），
//主函数中调用自定义函数。
#include<stdio.h>
#include<math.h>
int isPPDI(int x);
int main()
{
    int x, result;
    scanf("%d", &x);
    result = isPPDI(x);
    if (result == 1) {
        printf("%d是水仙花数！", x);
    } else {
        printf("%d不是水仙花数！", x);
    }
}
int isPPDI(int x){
	while(x>=100&&x<=999){
		
	int a=x/100;
	int b=x/10%10;
	int c=x%10;
	if(x==pow(a,3)+pow(b,3)+pow(c,3)){
		return 1;
	}
	else{
		return 0;
	}
	}
	
}

