//计算PI的近似值
//用户从键盘输入一个小于10的-5次方的正数eps，
//要求使用格雷戈里公式（PI/4=1-1/3+1/5-1/7+...）
//求PI的近似值，最后一项的绝对值小于eps。
#include<stdio.h> 
#include<math.h>
int main() 
{
	int i=0;
	double eps,term,pi=0.0;
	scanf("%lf",&eps);
	do{
		term=pow(-1,i)/(2*i+1);
		pi+=term;
		i++;	
	}
	while(fabs(term)>=eps);
	pi=pi*4;
	printf("%lf",pi);
	return 0;
}

